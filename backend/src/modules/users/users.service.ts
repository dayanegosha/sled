import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../../database/db.service';

type UserRow = {
  id: string;
  vk_id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  total_distance: number;
  created_at: string;
};

function needsUsername(username: string): boolean {
  return /^(vkid_|id)\d+$/.test(username);
}

@Injectable()
export class UsersService {
  constructor(private readonly db: DbService) {}

  async getProfile(id: string) {
    const { rows } = await this.db.query<UserRow>(
      `SELECT id, vk_id, username, display_name, avatar_url, bio, is_admin,
              COALESCE(total_distance, 0) as total_distance, created_at
       FROM users WHERE id = $1`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException('User not found');
    const user = rows[0];
    return { ...user, needs_username: needsUsername(user.username) };
  }

  async getStats(id: string) {
    const { rows } = await this.db.query(
      `SELECT COALESCE(total_distance, 0) as total_distance
       FROM users WHERE id = $1`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException('User not found');
    return {
      id,
      totalDistance: Number(rows[0].total_distance),
      exploredPct: 0,
    };
  }

  async getPosts(id: string) {
    return { items: [], userId: id };
  }

  async updateMe(
    userId: string,
    dto: { display_name?: string; username?: string; bio?: string },
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.display_name !== undefined) {
      if (dto.display_name.length < 1 || dto.display_name.length > 50) {
        throw new BadRequestException('display_name must be 1-50 characters');
      }
      fields.push(`display_name = $${idx++}`);
      values.push(dto.display_name.trim());
    }

    if (dto.username !== undefined) {
      const un = dto.username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,30}$/.test(un)) {
        throw new BadRequestException(
          'username must be 3-30 chars: a-z, 0-9, _',
        );
      }
      const existing = await this.db.query(
        'SELECT id FROM users WHERE LOWER(username) = $1 AND id != $2',
        [un, userId],
      );
      if (existing.rows.length > 0) {
        throw new BadRequestException('Username already taken');
      }
      fields.push(`username = $${idx++}`);
      values.push(un);
    }

    if (dto.bio !== undefined) {
      if (dto.bio.length > 300) {
        throw new BadRequestException('bio must be <= 300 characters');
      }
      fields.push(`bio = $${idx++}`);
      values.push(dto.bio.trim());
    }

    if (fields.length === 0) {
      return this.getProfile(userId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const { rows } = await this.db.query<UserRow>(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING id, vk_id, username, display_name, avatar_url, bio, is_admin`,
      values,
    );

    if (!rows[0]) throw new NotFoundException('User not found');
    const user = rows[0];
    return { ...user, needs_username: needsUsername(user.username) };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const { rows } = await this.db.query<UserRow>(
      `UPDATE users SET avatar_url = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, vk_id, username, display_name, avatar_url, bio, is_admin`,
      [avatarUrl, userId],
    );
    if (!rows[0]) throw new NotFoundException('User not found');
    const user = rows[0];
    return { ...user, needs_username: needsUsername(user.username) };
  }
}
