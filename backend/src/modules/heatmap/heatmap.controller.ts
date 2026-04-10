import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HeatmapService } from './heatmap.service';

@Controller('heatmap')
@UseGuards(JwtAuthGuard)
export class HeatmapController {
  constructor(private readonly heatmap: HeatmapService) {}

  @Get()
  getHeatmap(@Query('bbox') bbox = '', @Query('zoom') zoom = '10') {
    return this.heatmap.getHeatmap(bbox, Number(zoom));
  }

  @Get('top-regions')
  topRegions(@Query('lang') lang?: string) {
    const l = lang === 'en' || lang === 'zh' ? lang : 'ru';
    return this.heatmap.topRegions(l);
  }
}
