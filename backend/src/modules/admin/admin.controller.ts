import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}
  @Get('stats') stats() {
    return this.admin.stats();
  }
  @Get('users') users() {
    return this.admin.users();
  }
  @Patch('users/:id/ban') ban(
    @Param('id') id: string,
    @Body() b: { reason: string },
  ) {
    return this.admin.ban(id, b.reason);
  }
  @Patch('users/:id/unban') unban(@Param('id') id: string) {
    return this.admin.unban(id);
  }
  @Get('posts') posts() {
    return this.admin.posts();
  }
  @Patch('posts/:id/hide') hide(@Param('id') id: string) {
    return this.admin.hidePost(id);
  }
  @Get('audit') audit() {
    return this.admin.audit();
  }
  @Get('heatmap') heatmap() {
    return this.admin.heatmap();
  }
}
