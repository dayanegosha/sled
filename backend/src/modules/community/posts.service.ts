import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../../database/db.service';

@Injectable()
export class PostsService {
  constructor(private readonly db: DbService) {}

  async list() {
    const { rows } = await this.db.query<{
      id: string;
      content: string;
      created_at: Date;
      likes_count: number;
      comments_count: number;
      location_name: string | null;
      lng: number | null;
      lat: number | null;
      username: string;
      display_name: string;
      avatar_url: string | null;
      user_id: string;
    }>(
      `SELECT p.id, p.content, p.created_at, p.likes_count, p.comments_count,
              p.location_name,
              ST_X(p.location::geometry) AS lng,
              ST_Y(p.location::geometry) AS lat,
              u.username, u.display_name, u.avatar_url, u.id as user_id
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_hidden = false
       ORDER BY p.created_at DESC
       LIMIT 80`,
    );
    return {
      items: rows.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.created_at,
        likesCount: r.likes_count,
        commentsCount: r.comments_count,
        locationName: r.location_name,
        location:
          r.lat != null && r.lng != null
            ? { lat: r.lat, lng: r.lng }
            : null,
        author: {
          id: r.user_id,
          username: r.username,
          display_name: r.display_name,
          avatar_url: r.avatar_url,
        },
      })),
    };
  }

  async create(
    userId: string,
    dto: {
      content: string;
      lat?: number;
      lng?: number;
      locationName?: string;
    },
  ) {
    const content = (dto.content ?? '').trim();
    if (content.length < 1 || content.length > 2000) {
      throw new BadRequestException('content must be 1-2000 characters');
    }

    const locName = dto.locationName?.trim() || null;
    const hasLoc =
      dto.lat != null &&
      dto.lng != null &&
      Number.isFinite(dto.lat) &&
      Number.isFinite(dto.lng);

    const { rows } = hasLoc
      ? await this.db.query<{ id: string }>(
          `INSERT INTO posts (user_id, content, location, location_name)
           VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5)
           RETURNING id`,
          [userId, content, dto.lng, dto.lat, locName],
        )
      : await this.db.query<{ id: string }>(
          `INSERT INTO posts (user_id, content, location_name)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [userId, content, locName],
        );

    return { id: rows[0]?.id };
  }

  async report(
    reporterId: string,
    postId: string,
    reason?: string,
  ) {
    const post = await this.db.query(
      'SELECT id FROM posts WHERE id = $1 AND is_hidden = false',
      [postId],
    );
    if (post.rows.length === 0) throw new NotFoundException('Post not found');

    try {
      await this.db.query(
        `INSERT INTO post_reports (post_id, reporter_id, reason)
         VALUES ($1, $2, $3)
         ON CONFLICT (post_id, reporter_id) DO NOTHING`,
        [postId, reporterId, reason?.slice(0, 500) ?? null],
      );
    } catch {
      throw new BadRequestException('Report failed');
    }
    return { reported: true };
  }

  getOne(id: string) {
    return { id, comments: [] };
  }
  remove(id: string) {
    return { deleted: true, id };
  }
  toggleLike(id: string) {
    return { postId: id, liked: true };
  }
  listComments(id: string) {
    return { postId: id, items: [] };
  }
  addComment(id: string, dto: any) {
    return { id: crypto.randomUUID(), postId: id, ...dto };
  }
  removeComment(id: string) {
    return { deleted: true, id };
  }
}
