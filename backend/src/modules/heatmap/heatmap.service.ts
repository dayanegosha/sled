import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HeatmapService {
  private readonly redis: Redis;
  private readonly fallbackCache = new Map<string, string>();

  constructor(config: ConfigService) {
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
}
