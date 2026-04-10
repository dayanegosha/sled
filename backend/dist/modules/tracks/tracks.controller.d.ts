import { TracksService } from './tracks.service';
export declare class TracksController {
    private readonly tracks;
    constructor(tracks: TracksService);
    uploadBatch(user: any, body: {
        points: Array<{
            lat: number;
            lng: number;
            accuracy?: number;
            timestamp?: string;
        }>;
    }): Promise<{
        inserted: number;
    }>;
    getRevealed(user: any): Promise<any>;
    getStats(): {
        totalDistance: number;
        exploredPctRussia: number;
        topRegions: never[];
    };
    getRegions(): {
        regions: never[];
    };
}
