import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../../database/db.service';

@Injectable()
export class AdminService {
  constructor(private readonly db: DbService) {}

  async stats() {
    try {
      const [usersRes, activeRes, distanceRes, tracksRes, postsRes] =
        await Promise.all([
          this.db.query<{ total: string }>(
            'SELECT COUNT(*)::text AS total FROM users',
          ),
          this.db.query<{ total: string }>(
            `SELECT COUNT(*)::text AS total FROM users
             WHERE last_seen_at > NOW() - INTERVAL '24 hours'`,
          ),
          this.db.query<{ total_km: string }>(
            'SELECT COALESCE(SUM(total_distance), 0) / 1000.0 AS total_km FROM users',
          ),
          this.db.query<{ total: string }>(
            'SELECT COUNT(*)::text AS total FROM tracks',
          ),
          this.db.query<{ total: string }>(
            'SELECT COUNT(*)::text AS total FROM posts',
          ),
        ]);

      return {
        totalUsers: Number(usersRes.rows[0]?.total ?? 0),
        activeToday: Number(activeRes.rows[0]?.total ?? 0),
        totalDistanceKm: Math.round(
          Number(distanceRes.rows[0]?.total_km ?? 0),
        ),
        totalTrackPoints: Number(tracksRes.rows[0]?.total ?? 0),
        totalPosts: Number(postsRes.rows[0]?.total ?? 0),
      };
    } catch {
      return {
        totalUsers: 0,
        activeToday: 0,
        totalDistanceKm: 0,
        totalTrackPoints: 0,
        totalPosts: 0,
      };
    }
  }

  async users(page = 1, limit = 50, search?: string) {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = `WHERE LOWER(username) LIKE $1 OR LOWER(display_name) LIKE $1`;
      params.push(`%${search.toLowerCase()}%`);
    }

    const countQ = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM users ${whereClause}`,
      params,
    );
    const total = Number(countQ.rows[0]?.total ?? 0);

    const idx = params.length;
    params.push(limit, offset);

    const { rows } = await this.db.query(
      `SELECT id, vk_id, username, display_name, avatar_url,
              COALESCE(total_distance, 0) as total_distance,
              is_admin, is_banned, ban_reason,
              created_at, last_seen_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${idx + 1} OFFSET $${idx + 2}`,
      params,
    );

    return { items: rows, total, page, limit };
  }

  async ban(adminId: string, userId: string, reason: string) {
    const result = await this.db.query(
      `UPDATE users SET is_banned = true, ban_reason = $1, updated_at = NOW()
       WHERE id = $2 AND is_admin = false
       RETURNING id, username, is_banned`,
      [reason, userId],
    );
    if (result.rowCount === 0) throw new NotFoundException('User not found');

    await this.db.query(
      `INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, metadata)
       VALUES ($1, 'ban', 'user', $2, $3)`,
      [adminId, userId, JSON.stringify({ reason })],
    );

    return result.rows[0];
  }

  async unban(adminId: string, userId: string) {
    const result = await this.db.query(
      `UPDATE users SET is_banned = false, ban_reason = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING id, username, is_banned`,
      [userId],
    );
    if (result.rowCount === 0) throw new NotFoundException('User not found');

    await this.db.query(
      `INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, metadata)
       VALUES ($1, 'unban', 'user', $2, '{}')`,
      [adminId, userId],
    );

    return result.rows[0];
  }

  async posts(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { rows } = await this.db.query(
      `SELECT p.id, p.content, p.image_urls, p.likes_count, p.comments_count,
              p.is_hidden, p.created_at,
              u.username, u.display_name, u.avatar_url
       FROM posts p JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return { items: rows };
  }

  async hidePost(adminId: string, postId: string) {
    const result = await this.db.query(
      `UPDATE posts SET is_hidden = true, updated_at = NOW()
       WHERE id = $1
       RETURNING id, is_hidden`,
      [postId],
    );
    if (result.rowCount === 0) throw new NotFoundException('Post not found');

    try {
      await this.db.query(
        `UPDATE post_reports SET resolved = true WHERE post_id = $1`,
        [postId],
      );
    } catch {
      /* table may not exist yet */
    }

    await this.db.query(
      `INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, metadata)
       VALUES ($1, 'hide_post', 'post', $2, '{}')`,
      [adminId, postId],
    );

    return result.rows[0];
  }

  async reportedPosts() {
    try {
      const { rows } = await this.db.query(
        `SELECT pr.id as report_id, pr.reason, pr.created_at,
                p.id as post_id, p.content,
                u.username, u.display_name,
                ru.username as reporter_username
         FROM post_reports pr
         JOIN posts p ON p.id = pr.post_id
         JOIN users u ON u.id = p.user_id
         JOIN users ru ON ru.id = pr.reporter_id
         WHERE pr.resolved = false AND p.is_hidden = false
         ORDER BY pr.created_at DESC
         LIMIT 50`,
      );
      return { items: rows };
    } catch {
      return { items: [] };
    }
  }

  async audit(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { rows } = await this.db.query(
      `SELECT a.id, a.action, a.target_type, a.target_id, a.metadata, a.created_at,
              u.username as admin_username
       FROM admin_audit_log a JOIN users u ON a.admin_id = u.id
       ORDER BY a.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return { items: rows };
  }

  async analytics() {
    try {
      const dailyRes = await this.db.query<{
        day: string;
        new_users: string;
        active_users: string;
        track_points: string;
      }>(
        `SELECT
           d.day::text,
           COALESCE(nu.cnt, 0)::text AS new_users,
           COALESCE(au.cnt, 0)::text AS active_users,
           COALESCE(tp.cnt, 0)::text AS track_points
         FROM generate_series(
           CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day'
         ) AS d(day)
         LEFT JOIN (
           SELECT DATE(created_at) AS day, COUNT(*) AS cnt
           FROM users WHERE created_at > CURRENT_DATE - INTERVAL '14 days'
           GROUP BY DATE(created_at)
         ) nu ON nu.day = d.day
         LEFT JOIN (
           SELECT DATE(last_seen_at) AS day, COUNT(*) AS cnt
           FROM users WHERE last_seen_at > CURRENT_DATE - INTERVAL '14 days'
           GROUP BY DATE(last_seen_at)
         ) au ON au.day = d.day
         LEFT JOIN (
           SELECT DATE(recorded_at) AS day, COUNT(*) AS cnt
           FROM tracks WHERE recorded_at > CURRENT_DATE - INTERVAL '14 days'
           GROUP BY DATE(recorded_at)
         ) tp ON tp.day = d.day
         ORDER BY d.day`,
      );

      return {
        daily: dailyRes.rows.map((r) => ({
          day: r.day,
          newUsers: Number(r.new_users),
          activeUsers: Number(r.active_users),
          trackPoints: Number(r.track_points),
        })),
      };
    } catch {
      return { daily: [] };
    }
  }

  async suspiciousUsers() {
    try {
      const { rows } = await this.db.query(
        `SELECT u.id, u.username, u.display_name, u.avatar_url,
                COUNT(t.id) as flagged_points
         FROM users u
         JOIN tracks t ON t.user_id = u.id
         WHERE t.accuracy IS NOT NULL AND t.accuracy = 0
         GROUP BY u.id
         HAVING COUNT(t.id) > 10
         ORDER BY COUNT(t.id) DESC
         LIMIT 50`,
      );
      return { items: rows };
    } catch {
      return { items: [] };
    }
  }

  async heatmap() {
    return { type: 'FeatureCollection', features: [] };
  }
}
