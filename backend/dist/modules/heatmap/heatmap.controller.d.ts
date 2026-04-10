import { HeatmapService } from './heatmap.service';
export declare class HeatmapController {
    private readonly heatmap;
    constructor(heatmap: HeatmapService);
    getHeatmap(bbox?: string, zoom?: string): Promise<{
        type: string;
        features: unknown[];
    }>;
}
