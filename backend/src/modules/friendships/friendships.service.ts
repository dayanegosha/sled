import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DbService } from '../../database/db.service';

type FriendRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_distance: number;
  status: string;
};

@Injectable()
export class FriendshipsService {
  constructor(
    private readonly db: DbService,
    private readonly config: ConfigService,
  ) {}

  async list(userId: string) {
    const { rows } = await this.db.query<FriendRow>(
      `SELECT u.id, u.username, u.display_name, u.avatar_url,
              COALESCE(u.total_distance, 0) as total_distance,
              f.status
       FROM friendships f
       JOIN users u ON (
         CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
       ) = u.id
       WHERE (f.requester_id = $1 OR f.addressee_id = $1)
         AND f.status = 'accepted'`,
      [userId],
    );
    return { items: rows };
  }

  async requests(userId: string) {
    const { rows } = await this.db.query<FriendRow>(
      `SELECT u.id, u.username, u.display_name, u.avatar_url,
              COALESCE(u.total_distance, 0) as total_distance,
              f.status
       FROM friendships f
       JOIN users u ON f.requester_id = u.id
       WHERE f.addressee_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId],
    );
    return { items: rows };
  }

  async outgoing(userId: string) {
    const { rows } = await this.db.query<FriendRow>(
      `SELECT u.id, u.username, u.display_name, u.avatar_url,
              COALESCE(u.total_distance, 0) as total_distance,
              f.status
       FROM friendships f
       JOIN users u ON f.addressee_id = u.id
       WHERE f.requester_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId],
    );
    return { items: rows };
  }

  async send(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Cannot befriend yourself');
    }

    const existing = await this.db.query(
      `SELECT status FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2)
          OR (requester_id = $2 AND addressee_id = $1)`,
      [requesterId, addresseeId],
    );

    if (existing.rows.length > 0) {
      const st = existing.rows[0].status;
      if (st === 'accepted') throw new BadRequestException('Already friends');
      if (st === 'pending')
        throw new BadRequestException('Request already sent');
      if (st === 'blocked')
        throw new BadRequestException('Cannot send request');
    }

    await this.db.query(
      `INSERT INTO friendships (requester_id, addressee_id, status)
       VALUES ($1, $2, 'pending')`,
      [requesterId, addresseeId],
    );
    return { sent: true };
  }

  async update(
    currentUserId: string,
    requesterId: string,
    action: 'accept' | 'reject',
  ) {
    if (action === 'accept') {
      const result = await this.db.query(
        `UPDATE friendships SET status = 'accepted', updated_at = NOW()
         WHERE requester_id = $1 AND addressee_id = $2 AND status = 'pending'`,
        [requesterId, currentUserId],
      );
      if (result.rowCount === 0)
        throw new NotFoundException('Request not found');
      return { accepted: true };
    }

    const result = await this.db.query(
      `DELETE FROM friendships
       WHERE requester_id = $1 AND addressee_id = $2 AND status = 'pending'`,
      [requesterId, currentUserId],
    );
    if (result.rowCount === 0) throw new NotFoundException('Request not found');
    return { rejected: true };
  }

  async remove(currentUserId: string, friendId: string) {
    await this.db.query(
      `DELETE FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2)
          OR (requester_id = $2 AND addressee_id = $1)`,
      [currentUserId, friendId],
    );
    return { removed: true };
  }

  async compare(currentUserId: string, friendId: string) {
    const [meRes, friendRes] = await Promise.all([
      this.db.query(
        `SELECT COALESCE(total_distance, 0) as total_distance FROM users WHERE id = $1`,
        [currentUserId],
      ),
      this.db.query(
        `SELECT id, username, display_name, avatar_url,
                COALESCE(total_distance, 0) as total_distance
         FROM users WHERE id = $1`,
        [friendId],
      ),
    ]);

    if (!friendRes.rows[0]) throw new NotFoundException('User not found');

    return {
      me: { totalDistance: Number(meRes.rows[0]?.total_distance ?? 0) },
      friend: {
        ...friendRes.rows[0],
        totalDistance: Number(friendRes.rows[0].total_distance),
      },
    };
  }

  async search(query: string, currentUserId: string) {
    const { rows } = await this.db.query(
      `SELECT id, username, display_name, avatar_url
       FROM users
       WHERE id != $1
         AND (LOWER(username) LIKE $2 OR LOWER(display_name) LIKE $2)
       LIMIT 20`,
      [currentUserId, `%${query.toLowerCase()}%`],
    );
    return { items: rows };
  }

  async importFromVk(currentUserId: string) {
    const { rows: userRows } = await this.db.query<{ vk_id: number }>(
      'SELECT vk_id FROM users WHERE id = $1',
      [currentUserId],
    );
    if (!userRows[0]) throw new NotFoundException('User not found');

    const serviceKey = this.config.get<string>('VK_SERVICE_KEY');
    if (!serviceKey) {
      throw new BadRequestException('VK service key not configured');
    }

    let vkFriendIds: number[] = [];
    try {
      const res = await axios.get<{
        response: { items: number[]; count: number };
      }>('https://api.vk.com/method/friends.get', {
        params: {
          user_id: userRows[0].vk_id,
          access_token: serviceKey,
          v: '5.199',
        },
      });
      vkFriendIds = res.data.response?.items ?? [];
    } catch {
      return { imported: 0, items: [] };
    }

    if (vkFriendIds.length === 0) return { imported: 0, items: [] };

    const placeholders = vkFriendIds.map((_, i) => `$${i + 1}`).join(',');
    const { rows: matchedUsers } = await this.db.query<{
      id: string;
      username: string;
      display_name: string;
      avatar_url: string | null;
    }>(
      `SELECT id, username, display_name, avatar_url
       FROM users WHERE vk_id IN (${placeholders}) AND id != $${vkFriendIds.length + 1}`,
      [...vkFriendIds, currentUserId],
    );

    let imported = 0;
    for (const friend of matchedUsers) {
      try {
        const ins = await this.db.query(
          `INSERT INTO friendships (requester_id, addressee_id, status)
           VALUES ($1, $2, 'accepted')
           ON CONFLICT (requester_id, addressee_id) DO NOTHING`,
          [currentUserId, friend.id],
        );
        if (ins.rowCount && ins.rowCount > 0) imported++;
      } catch {
        /* skip */
      }
    }

    return {
      imported,
      items: matchedUsers,
      message:
        matchedUsers.length === 0
          ? 'Среди друзей ВК пока никто не зарегистрирован в Следе'
          : undefined,
    };
  }
}
