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
        timestamp?: string;
      }>;
    },
  ) {
    return this.tracks.uploadBatch(user.sub ?? user.id, body.points ?? []);
  }

  @Get('revealed') getRevealed(@CurrentUser() user: any) {
    return this.tracks.getRevealed(user.sub ?? user.id);
  }
  @Get('stats') getStats() {
    return this.tracks.getStats();
  }
  @Get('regions') getRegions() {
    return this.tracks.getRegions();
  }
}
