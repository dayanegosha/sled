import { FriendshipsService } from './friendships.service';
export declare class FriendshipsController {
    private readonly friendships;
    constructor(friendships: FriendshipsService);
    list(): {
        items: never[];
    };
    requests(): {
        items: never[];
    };
    send(userId: string): {
        sent: boolean;
        userId: string;
    };
    update(userId: string, body: {
        action: 'accept' | 'reject';
    }): {
        userId: string;
        action: "accept" | "reject";
    };
    remove(userId: string): {
        removed: boolean;
        userId: string;
    };
    compare(userId: string): {
        userId: string;
        compare: {};
    };
}
