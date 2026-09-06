import { Module } from '@nestjs/common';
import { TuitionController } from './tuition.controller';
import { TuitionRepository } from './tuition.repository';
import { TuitionService } from './tuition.service';

@Module({
  imports: [],
  controllers: [TuitionController],
  providers: [TuitionService, TuitionRepository],
  exports: [TuitionService],
})
export class TuitionModule {}
