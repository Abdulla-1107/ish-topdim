import { Module } from '@nestjs/common';
import { RegionController } from './region.controller';
import { cityService } from './region.service';

@Module({
  controllers: [RegionController],
  providers: [cityService],
})
export class RegionModule {}
