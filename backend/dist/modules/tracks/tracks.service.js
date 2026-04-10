"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracksService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../../database/db.service");
let TracksService = class TracksService {
    db;
    constructor(db) {
        this.db = db;
    }
    async uploadBatch(userId, points) {
        if (points.length > 100)
            throw new Error('Max 100 points per request');
        for (const p of points) {
            await this.db.query('INSERT INTO tracks(user_id, location, accuracy, recorded_at) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, COALESCE($5::timestamptz, NOW()))', [userId, p.lng, p.lat, p.accuracy ?? null, p.timestamp ?? null]);
        }
        return { inserted: points.length };
    }
    async getRevealed(userId) {
        const { rows } = await this.db.query('SELECT ST_AsGeoJSON(geom::geometry) AS geojson FROM revealed_areas WHERE user_id = $1', [userId]);
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
};
exports.TracksService = TracksService;
exports.TracksService = TracksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService])
], TracksService);
//# sourceMappingURL=tracks.service.js.map