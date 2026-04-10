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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatmapService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("@nestjs/config");
let HeatmapService = class HeatmapService {
    redis;
    fallbackCache = new Map();
    constructor(config) {
        this.redis = new ioredis_1.default({
            host: config.get('REDIS_HOST'),
            port: config.get('REDIS_PORT'),
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
        });
        this.redis.on('error', () => {
        });
    }
    async getHeatmap(bbox, zoom) {
        const key = `heatmap:${bbox}:${zoom}`;
        const result = { type: 'FeatureCollection', features: [] };
        try {
            if (this.redis.status !== 'ready') {
                await this.redis.connect();
            }
            const cached = await this.redis.get(key);
            if (cached)
                return JSON.parse(cached);
            await this.redis.setex(key, 300, JSON.stringify(result));
            return result;
        }
        catch {
            const cached = this.fallbackCache.get(key);
            if (cached)
                return JSON.parse(cached);
            this.fallbackCache.set(key, JSON.stringify(result));
        }
        return result;
    }
};
exports.HeatmapService = HeatmapService;
exports.HeatmapService = HeatmapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HeatmapService);
//# sourceMappingURL=heatmap.service.js.map