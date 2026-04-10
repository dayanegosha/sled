import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FriendshipsService } from './friendships.service';

@Controller('friendships')
@UseGuards(JwtAuthGuard)
export class FriendshipsController {
  constructor(private readonly friendships: FriendshipsService) {}
  @Get() list() {
    return this.friendships.list();
  }
  @Get('requests') requests() {
    return this.friendships.requests();
  }
  @Post(':userId') send(@Param('userId') userId: string) {
    return this.friendships.send(userId);
  }
  @Patch(':userId') update(
    @Param('userId') userId: string,
    @Body() body: { action: 'accept' | 'reject' },
  ) {
    return this.friendships.update(userId, body.action);
  }
  @Delete(':userId') remove(@Param('userId') userId: string) {
    return this.friendships.remove(userId);
  }
  @Get('compare/:userId') compare(@Param('userId') userId: string) {
    return this.friendships.compare(userId);
  }
}
