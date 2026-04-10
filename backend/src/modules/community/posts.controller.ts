import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from './posts.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get('posts')
  list() {
    return this.posts.list();
  }

  @Post('posts')
  create(
    @CurrentUser() user: { sub?: string; id?: string },
    @Body()
    dto: { content: string; lat?: number; lng?: number; locationName?: string },
  ) {
    const uid = user.id ?? user.sub;
    if (!uid) throw new UnauthorizedException();
    return this.posts.create(uid, dto);
  }

  @Post('posts/:id/report')
  report(
    @CurrentUser() user: { sub?: string; id?: string },
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const uid = user.id ?? user.sub;
    if (!uid) throw new UnauthorizedException();
    return this.posts.report(uid, id, body?.reason);
  }

  @Get('posts/:id')
  getOne(@Param('id') id: string) {
    return this.posts.getOne(id);
  }

  @Delete('posts/:id')
  remove(@Param('id') id: string) {
    return this.posts.remove(id);
  }

  @Post('posts/:id/like')
  like(@Param('id') id: string) {
    return this.posts.toggleLike(id);
  }

  @Delete('posts/:id/like')
  unlike(@Param('id') id: string) {
    return this.posts.toggleLike(id);
  }

  @Get('posts/:id/comments')
  comments(@Param('id') id: string) {
    return this.posts.listComments(id);
  }

  @Post('posts/:id/comments')
  addComment(@Param('id') id: string, @Body() dto: any) {
    return this.posts.addComment(id, dto);
  }

  @Delete('comments/:id')
  removeComment(@Param('id') id: string) {
    return this.posts.removeComment(id);
  }
}
