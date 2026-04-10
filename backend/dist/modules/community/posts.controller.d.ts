import { PostsService } from './posts.service';
export declare class PostsController {
    private readonly posts;
    constructor(posts: PostsService);
    list(): {
        items: never[];
        nextCursor: null;
    };
    create(dto: any): any;
    getOne(id: string): {
        id: string;
        comments: never[];
    };
    remove(id: string): {
        deleted: boolean;
        id: string;
    };
    like(id: string): {
        postId: string;
        liked: boolean;
    };
    unlike(id: string): {
        postId: string;
        liked: boolean;
    };
    comments(id: string): {
        postId: string;
        items: never[];
    };
    addComment(id: string, dto: any): any;
    removeComment(id: string): {
        deleted: boolean;
        id: string;
    };
}
