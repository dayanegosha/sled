import { Injectable } from '@nestjs/common';
import { DbService } from '../../database/db.service';

@Injectable()
export class TracksService {
  constructor(private readonly db: DbService) {}

  async uploadBatch(
    userId: string,
    points: Array<{
      lat: number;
      lng: number;
      accuracy?: number;
      timestamp?: string;
    }>,
  ) {
    if (points.length > 100) throw new Error('Max 100 points per request');
    for (const p of points) {
      await this.db.query(
        'INSERT INTO tracks(user_id, location, accuracy, recorded_at) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, COALESCE($5::timestamptz, NOW()))',
        [userId, p.lng, p.lat, p.accuracy ?? null, p.timestamp ?? null],
      );
    }
    return { inserted: points.length };
  }

  async getRevealed(userId: string) {
    const { rows } = await this.db.query(
      'SELECT ST_AsGeoJSON(geom::geometry) AS geojson FROM revealed_areas WHERE user_id = $1',
      [userId],
    );
    return rows[0]?.geojson
      ? JSON.parse(rows[0].geojson)
      : { type: 'FeatureCollection', features: [] };
  }

  getStats() {
    return { totalDistance: 0, exploredPctRussia: 0, topRegions: [] };
  }
  getRegions() {
    return { regions: [] };
  }
}
