import { ConfigService } from '@nestjs/config';
export declare class HeatmapService {
    private readonly redis;
    private readonly fallbackCache;
    constructor(config: ConfigService);
    getHeatmap(bbox: string, zoom: number): Promise<{
        type: string;
        features: unknown[];
    }>;
}
