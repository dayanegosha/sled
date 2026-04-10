export declare class PostsService {
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
    toggleLike(id: string): {
        postId: string;
        liked: boolean;
    };
    listComments(id: string): {
        postId: string;
        items: never[];
    };
    addComment(id: string, dto: any): any;
    removeComment(id: string): {
        deleted: boolean;
        id: string;
    };
}
