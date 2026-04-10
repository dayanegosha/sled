import { DbService } from '../../database/db.service';
export declare class TracksService {
    private readonly db;
    constructor(db: DbService);
    uploadBatch(userId: string, points: Array<{
        lat: number;
        lng: number;
        accuracy?: number;
        timestamp?: string;
    }>): Promise<{
        inserted: number;
    }>;
    getRevealed(userId: string): Promise<any>;
    getStats(): {
        totalDistance: number;
        exploredPctRussia: number;
        topRegions: never[];
    };
    getRegions(): {
        regions: never[];
    };
}
