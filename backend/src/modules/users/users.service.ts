import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getProfile(id: string) {
    return { id, username: 'user', display_name: 'User' };
  }
  getStats(id: string) {
    return { id, exploredPct: 0, totalDistance: 0 };
  }
  getPosts(id: string) {
    return { items: [], userId: id };
  }
  updateMe(dto: any) {
    return { updated: true, ...dto };
  }
}
