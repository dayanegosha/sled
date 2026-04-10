import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { DbService } from '../../database/db.service';

@Injectable()
export class HeatmapService {
  private readonly redis: Redis;
  private readonly fallbackCache = new Map<string, string>();

  constructor(
    config: ConfigService,
    private readonly db: DbService,
  ) {
    this.redis = new Redis({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    this.redis.on('error', () => {
      // Redis is optional for local dev; service falls back to in-memory cache.
    });
  }

  async getHeatmap(bbox: string, zoom: number) {
    const key = `heatmap:${bbox}:${zoom}`;
    const result = { type: 'FeatureCollection', features: [] };

    try {
      if (this.redis.status !== 'ready') {
        await this.redis.connect();
      }
      const cached = await this.redis.get(key);
      if (cached)
        return JSON.parse(cached) as { type: string; features: unknown[] };
      await this.redis.setex(key, 300, JSON.stringify(result));
      return result;
    } catch {
      const cached = this.fallbackCache.get(key);
      if (cached)
        return JSON.parse(cached) as { type: string; features: unknown[] };
      this.fallbackCache.set(key, JSON.stringify(result));
    }

    return result;
  }

  async topRegions(lang: 'ru' | 'en' | 'zh' = 'ru') {
    try {
      const { rows } = await this.db.query<{
        name: string;
        users: string;
        score: string;
      }>(
        `SELECT
           CASE $1::text
             WHEN 'en' THEN r.name_en
             WHEN 'zh' THEN COALESCE(r.name_zh, r.name_ru)
             ELSE r.name_ru
           END AS name,
           COUNT(DISTINCT urs.user_id)::text AS users,
           COALESCE(SUM(urs.explored_m2), 0)::text AS score
         FROM regions r
         LEFT JOIN user_region_stats urs ON urs.region_id = r.id AND urs.explored_m2 > 0
         GROUP BY r.id, r.name_ru, r.name_en, r.name_zh
         ORDER BY COUNT(DISTINCT urs.user_id) DESC NULLS LAST,
                  COALESCE(SUM(urs.explored_m2), 0) DESC
         LIMIT 8`,
        [lang],
      );
      return {
        items: rows.map((r) => ({
          name: r.name,
          users: Number(r.users),
          score: Number(r.score),
        })),
      };
    } catch {
      return { items: [] };
    }
  }
}
