import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  stats() {
    return { users: 0, posts: 0, tracks: 0 };
  }
  users() {
    return { items: [] };
  }
  ban(id: string, reason: string) {
    return { id, banned: true, reason };
  }
  unban(id: string) {
    return { id, banned: false };
  }
  posts() {
    return { items: [] };
  }
  hidePost(id: string) {
    return { id, hidden: true };
  }
  audit() {
    return { items: [] };
  }
  heatmap() {
    return { type: 'FeatureCollection', features: [] };
  }
}
