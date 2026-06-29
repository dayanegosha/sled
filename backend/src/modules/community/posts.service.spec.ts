import { Test } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { DbService } from '../../database/db.service';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PostsService,
        // addComment / toggleLike don't touch the DB; a stub is enough here.
        { provide: DbService, useValue: { query: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(PostsService);
  });

  describe('addComment', () => {
    it('attaches a generated id and the post id to the comment', () => {
      const result = service.addComment('post-1', { text: 'Nice trip!' });

      expect(result).toMatchObject({ postId: 'post-1', text: 'Nice trip!' });
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('gives each comment a unique id', () => {
      const a = service.addComment('post-1', { text: 'one' });
      const b = service.addComment('post-1', { text: 'two' });

      expect(a.id).not.toEqual(b.id);
    });
  });

  describe('toggleLike', () => {
    it('reports the post as liked', () => {
      expect(service.toggleLike('post-9')).toEqual({
        postId: 'post-9',
        liked: true,
      });
    });
  });
});
