import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly admin;
    constructor(admin: AdminService);
    stats(): {
        users: number;
        posts: number;
        tracks: number;
    };
    users(): {
        items: never[];
    };
    ban(id: string, b: {
        reason: string;
    }): {
        id: string;
        banned: boolean;
        reason: string;
    };
    unban(id: string): {
        id: string;
        banned: boolean;
    };
    posts(): {
        items: never[];
    };
    hide(id: string): {
        id: string;
        hidden: boolean;
    };
    audit(): {
        items: never[];
    };
    heatmap(): {
        type: string;
        features: never[];
    };
}
