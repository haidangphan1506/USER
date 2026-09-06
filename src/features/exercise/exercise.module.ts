import { Module } from '@nestjs/common';
import { ExerciseController } from './exercise.controller';
import { ExerciseRepository } from './exercise.repository';
import { ExerciseService } from './exercise.service';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [UserModule, SessionModule, LessonModule],
  controllers: [ExerciseController],
  providers: [ExerciseService, ExerciseRepository],
  exports: [ExerciseService],
})
export class ExerciseModule {}
