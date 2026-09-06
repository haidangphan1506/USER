import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';
import { CurriculumRepository } from './curriculum.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, MulterModule.register({})],
  controllers: [CurriculumController],
  providers: [CurriculumService, CurriculumRepository],
  exports: [CurriculumService],
})
export class CurriculumModule {}
