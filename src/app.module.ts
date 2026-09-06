import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { DatabaseModule } from './database/database.module';
// import { RabbitMQModule } from './features/rabbitmq/rabbitmq.module';
import { UserModule } from './features/user/user.module';
import { AdminModule } from './features/admin/admin.module';
import { ClassModule } from './features/class/class.module';
import { StudentModule } from './features/student/student.module';
import { CurriculumModule } from './features/curriculum/curriculum.module';
import { ChapterModule } from './features/chapter/chapter.module';
import { LessonModule } from './features/lesson/lesson.module';
import { TuitionModule } from './features/tuition/tuition.module';
import { ScheduleModule } from './features/schedule/schedule.module';
import { SessionModule } from './features/session/session.module';
import { JwtAuthGuard, LanguageGuard } from '@packages/guards';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ExerciseModule } from './features/exercise/exercise.module';
import { AttendanceModule } from './features/attendance/attendance.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { ReportModule } from './features/report/report.module';
import { ChatModule } from './features/chat/chat.module';
import { AgentsModule } from './features/agents/agents.module';
import { RabbitMQModule } from './features/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    RabbitMQModule,
    UserModule,
    AdminModule,
    AuthModule,
    ClassModule,
    StudentModule,
    LessonModule,
    CurriculumModule,
    ChapterModule,
    TuitionModule,
    ScheduleModule,
    SessionModule,
    ExerciseModule,
    AttendanceModule,
    DashboardModule,
    AgentsModule,
    ReportModule,
    ChatModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: LanguageGuard,
    },
  ],
})
export class AppModule {}
