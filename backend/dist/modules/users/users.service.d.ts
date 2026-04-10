export declare class UsersService {
    getProfile(id: string): {
        id: string;
        username: string;
        display_name: string;
    };
    getStats(id: string): {
        id: string;
        exploredPct: number;
        totalDistance: number;
    };
    getPosts(id: string): {
        items: never[];
        userId: string;
    };
    updateMe(dto: any): any;
}
