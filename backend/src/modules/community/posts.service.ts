import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  list() {
    return { items: [], nextCursor: null };
  }
  create(dto: any) {
    return { id: crypto.randomUUID(), ...dto };
  }
  getOne(id: string) {
    return { id, comments: [] };
  }
  remove(id: string) {
    return { deleted: true, id };
  }
  toggleLike(id: string) {
    return { postId: id, liked: true };
  }
  listComments(id: string) {
    return { postId: id, items: [] };
  }
  addComment(id: string, dto: any) {
    return { id: crypto.randomUUID(), postId: id, ...dto };
  }
  removeComment(id: string) {
    return { deleted: true, id };
  }
}
