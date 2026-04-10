import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FriendshipsService } from './friendships.service';

@Controller('friendships')
@UseGuards(JwtAuthGuard)
export class FriendshipsController {
  constructor(private readonly friendships: FriendshipsService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.friendships.list(user.id ?? user.sub);
  }

  @Get('requests')
  requests(@CurrentUser() user: any) {
    return this.friendships.requests(user.id ?? user.sub);
  }

  @Get('outgoing')
  outgoing(@CurrentUser() user: any) {
    return this.friendships.outgoing(user.id ?? user.sub);
  }

  @Get('search')
  search(@CurrentUser() user: any, @Query('q') query: string) {
    return this.friendships.search(query ?? '', user.id ?? user.sub);
  }

  @Post('import-vk')
  importFromVk(@CurrentUser() user: any) {
    return this.friendships.importFromVk(user.id ?? user.sub);
  }

  @Post(':userId')
  send(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.friendships.send(user.id ?? user.sub, userId);
  }

  @Patch(':userId')
  update(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
    @Body() body: { action: 'accept' | 'reject' },
  ) {
    return this.friendships.update(user.id ?? user.sub, userId, body.action);
  }

  @Delete(':userId')
  remove(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.friendships.remove(user.id ?? user.sub, userId);
  }

  @Get('compare/:userId')
  compare(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.friendships.compare(user.id ?? user.sub, userId);
  }
}
