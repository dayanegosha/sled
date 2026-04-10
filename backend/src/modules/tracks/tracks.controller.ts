import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TracksService } from './tracks.service';

@Controller('tracks')
@UseGuards(JwtAuthGuard)
export class TracksController {
  constructor(private readonly tracks: TracksService) {}

  @Post('batch')
  uploadBatch(
    @CurrentUser() user: any,
    @Body()
    body: {
      points: Array<{
        lat: number;
        lng: number;
        accuracy?: number;
        timestamp?: string | number;
      }>;
    },
  ) {
    return this.tracks.uploadBatch(user.sub ?? user.id, body.points ?? []);
  }

  @Get('revealed')
  getRevealed(@CurrentUser() user: any) {
    return this.tracks.getRevealed(user.sub ?? user.id);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.tracks.getStats(user.sub ?? user.id);
  }

  @Get('today')
  getToday(@CurrentUser() user: any) {
    return this.tracks.getTodayStats(user.sub ?? user.id);
  }

  @Get('regions')
  getRegions(@CurrentUser() user: any) {
    return this.tracks.getRegions(user.sub ?? user.id);
  }
}
