import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get(':id') getProfile(@Param('id') id: string) {
    return this.users.getProfile(id);
  }
  @Get(':id/stats') getStats(@Param('id') id: string) {
    return this.users.getStats(id);
  }
  @Get(':id/posts') getPosts(@Param('id') id: string) {
    return this.users.getPosts(id);
  }
  @Patch('me') @UseGuards(JwtAuthGuard) updateMe(@Body() dto: any) {
    return this.users.updateMe(dto);
  }
}
