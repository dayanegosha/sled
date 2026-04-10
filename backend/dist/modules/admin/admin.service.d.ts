export declare class AdminService {
    stats(): {
        users: number;
        posts: number;
        tracks: number;
    };
    users(): {
        items: never[];
    };
    ban(id: string, reason: string): {
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
    hidePost(id: string): {
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
