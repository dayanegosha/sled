import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Get('users')
  users(@Query('page') page?: string, @Query('search') search?: string) {
    return this.admin.users(Number(page) || 1, 50, search);
  }

  @Patch('users/:id/ban')
  ban(
    @CurrentUser() admin: any,
    @Param('id') id: string,
    @Body() b: { reason: string },
  ) {
    return this.admin.ban(admin.id ?? admin.sub, id, b.reason);
  }

  @Patch('users/:id/unban')
  unban(@CurrentUser() admin: any, @Param('id') id: string) {
    return this.admin.unban(admin.id ?? admin.sub, id);
  }

  @Get('posts')
  posts(@Query('page') page?: string) {
    return this.admin.posts(Number(page) || 1);
  }

  @Get('reports')
  reports() {
    return this.admin.reportedPosts();
  }

  @Patch('posts/:id/hide')
  hide(@CurrentUser() admin: any, @Param('id') id: string) {
    return this.admin.hidePost(admin.id ?? admin.sub, id);
  }

  @Get('audit')
  audit(@Query('page') page?: string) {
    return this.admin.audit(Number(page) || 1);
  }

  @Get('analytics')
  analytics() {
    return this.admin.analytics();
  }

  @Get('suspicious')
  suspicious() {
    return this.admin.suspiciousUsers();
  }

  @Get('heatmap')
  heatmap() {
    return this.admin.heatmap();
  }
}
