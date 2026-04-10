import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from './posts.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly posts: PostsService) {}
  @Get('posts') list() {
    return this.posts.list();
  }
  @Post('posts') create(@Body() dto: any) {
    return this.posts.create(dto);
  }
  @Get('posts/:id') getOne(@Param('id') id: string) {
    return this.posts.getOne(id);
  }
  @Delete('posts/:id') remove(@Param('id') id: string) {
    return this.posts.remove(id);
  }
  @Post('posts/:id/like') like(@Param('id') id: string) {
    return this.posts.toggleLike(id);
  }
  @Delete('posts/:id/like') unlike(@Param('id') id: string) {
    return this.posts.toggleLike(id);
  }
  @Get('posts/:id/comments') comments(@Param('id') id: string) {
    return this.posts.listComments(id);
  }
  @Post('posts/:id/comments') addComment(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.posts.addComment(id, dto);
  }
  @Delete('comments/:id') removeComment(@Param('id') id: string) {
    return this.posts.removeComment(id);
  }
}
