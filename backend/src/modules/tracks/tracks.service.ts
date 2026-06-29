import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DbService } from '../../database/db.service';

const MAX_HUMAN_SPEED_MPS = 85;
const MIN_ACCURACY_THRESHOLD = 5;
const MAX_BATCH_SIZE = 100;

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type RawPoint = {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: string | number;
};

type ValidatedPoint = RawPoint & { flagged: boolean; reason?: string };

@Injectable()
export class TracksService {
  private readonly logger = new Logger(TracksService.name);

  constructor(private readonly db: DbService) {}

  private validatePoints(points: RawPoint[]): ValidatedPoint[] {
    return points.map((p, i) => {
      if (p.lat < -90 || p.lat > 90 || p.lng < -180 || p.lng > 180) {
        return { ...p, flagged: true, reason: 'invalid_coords' };
      }

      if (
        p.accuracy !== undefined &&
        p.accuracy !== null &&
        p.accuracy < MIN_ACCURACY_THRESHOLD
      ) {
        return { ...p, flagged: true, reason: 'suspicious_accuracy' };
      }

      if (i > 0) {
        const prev = points[i - 1];
        const dist = haversineDistance(prev.lat, prev.lng, p.lat, p.lng);

        let timeDiffSec = 5;
        if (p.timestamp && prev.timestamp) {
          const t1 =
            typeof prev.timestamp === 'number'
              ? prev.timestamp
              : new Date(prev.timestamp).getTime();
          const t2 =
            typeof p.timestamp === 'number'
              ? p.timestamp
              : new Date(p.timestamp).getTime();
          timeDiffSec = Math.max(Math.abs(t2 - t1) / 1000, 0.1);
        }

        const speed = dist / timeDiffSec;

        if (speed > MAX_HUMAN_SPEED_MPS) {
          return {
            ...p,
            flagged: true,
            reason: `teleport_${Math.round(speed)}mps_${Math.round(dist)}m`,
          };
        }
      }

      return { ...p, flagged: false };
    });
  }

  async uploadBatch(userId: string, points: RawPoint[]) {
    if (!points || points.length === 0) return { inserted: 0, flagged: 0 };
    if (points.length > MAX_BATCH_SIZE) {
      throw new BadRequestException(`Max ${MAX_BATCH_SIZE} points per request`);
    }

    const isBanned = await this.db.query(
      'SELECT is_banned FROM users WHERE id = $1',
      [userId],
    );
    if (isBanned.rows[0]?.is_banned) {
      throw new BadRequestException('Account suspended');
    }

    const validated = this.validatePoints(points);
    const clean = validated.filter((p) => !p.flagged);
    const flagged = validated.filter((p) => p.flagged);

    if (flagged.length > 0) {
      this.logger.warn(
        `User ${userId}: ${flagged.length}/${points.length} points flagged — ${flagged.map((f) => f.reason).join(', ')}`,
      );
    }

    let inserted = 0;
    for (const p of clean) {
      try {
        await this.db.query(
          `INSERT INTO tracks(user_id, location, accuracy, recorded_at)
           VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4,
                   COALESCE(to_timestamp($5::double precision / 1000), NOW()))`,
          [userId, p.lng, p.lat, p.accuracy ?? null, p.timestamp ?? null],
        );
        inserted++;
      } catch {
        // skip individual point on error
      }
    }

    if (inserted > 0) {
      try {
        await this.db.query(
          `UPDATE users SET last_seen_at = NOW() WHERE id = $1`,
          [userId],
        );
      } catch {
        // non-critical
      }
    }

    return { inserted, flagged: flagged.length, total: points.length };
  }

  async getRevealed(userId: string) {
    const { rows } = await this.db.query<{ geojson: string }>(
      'SELECT ST_AsGeoJSON(geom::geometry) AS geojson FROM revealed_areas WHERE user_id = $1',
      [userId],
    );
    return rows[0]?.geojson
      ? JSON.parse(rows[0].geojson)
      : { type: 'FeatureCollection', features: [] };
  }

  async getStats(userId: string) {
    try {
      const [distRes, regionRes, trackRes] = await Promise.all([
        this.db.query(
          'SELECT COALESCE(total_distance, 0) as dist FROM users WHERE id = $1',
          [userId],
        ),
        this.db.query(
          'SELECT COUNT(DISTINCT region_id)::text as cnt FROM user_region_stats WHERE user_id = $1 AND explored_pct > 0',
          [userId],
        ),
        this.db.query(
          'SELECT COUNT(*)::text as cnt FROM tracks WHERE user_id = $1',
          [userId],
        ),
      ]);

      return {
        totalDistance: Number(distRes.rows[0]?.dist ?? 0),
        regionsVisited: Number(regionRes.rows[0]?.cnt ?? 0),
        trackPoints: Number(trackRes.rows[0]?.cnt ?? 0),
      };
    } catch {
      return { totalDistance: 0, regionsVisited: 0, trackPoints: 0 };
    }
  }

  async getRegions(userId: string) {
    try {
      const { rows } = await this.db.query(
        `SELECT r.name_ru, r.code, urs.explored_pct
         FROM user_region_stats urs
         JOIN regions r ON r.id = urs.region_id
         WHERE urs.user_id = $1 AND urs.explored_pct > 0
         ORDER BY urs.explored_pct DESC`,
        [userId],
      );
      return { regions: rows };
    } catch {
      return { regions: [] };
    }
  }

  async getTodayStats(userId: string) {
    try {
      const { rows } = await this.db.query<{ meters: string }>(
        `WITH ordered AS (
           SELECT location,
                  LAG(location) OVER (ORDER BY recorded_at) AS prev_loc
           FROM tracks
           WHERE user_id = $1 AND recorded_at >= CURRENT_DATE
         )
         SELECT COALESCE(
           SUM(
             CASE WHEN prev_loc IS NOT NULL THEN
               ST_Distance(prev_loc::geography, location::geography)
             ELSE 0 END
           ),
           0
         )::text AS meters
         FROM ordered`,
        [userId],
      );
      const meters = Number(rows[0]?.meters ?? 0);
      return {
        todayDistanceM: meters,
        todayKm: Math.round((meters / 1000) * 100) / 100,
      };
    } catch {
      return { todayDistanceM: 0, todayKm: 0 };
    }
  }
}
