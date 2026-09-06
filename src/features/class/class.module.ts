import { Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassRepository } from './class.repository';
import { ClassService } from './class.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ClassController],
  providers: [ClassService, ClassRepository],
  exports: [ClassService],
})
export class ClassModule {}
