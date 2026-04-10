import { Injectable } from '@nestjs/common';

@Injectable()
export class FriendshipsService {
  list() {
    return { items: [] };
  }
  requests() {
    return { items: [] };
  }
  send(userId: string) {
    return { sent: true, userId };
  }
  update(userId: string, action: 'accept' | 'reject') {
    return { userId, action };
  }
  remove(userId: string) {
    return { removed: true, userId };
  }
  compare(userId: string) {
    return { userId, compare: {} };
  }
}
