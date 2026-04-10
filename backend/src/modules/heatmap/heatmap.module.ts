import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HeatmapController } from './heatmap.controller';
import { HeatmapService } from './heatmap.service';

@Module({
  imports: [AuthModule],
  controllers: [HeatmapController],
  providers: [HeatmapService],
})
export class HeatmapModule {}
