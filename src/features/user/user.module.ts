import { Module } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@packages/guards';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtAuthGuard, RolesGuard, JwtService, ConfigService],
  exports: [UserService],
})
export class UserModule {}
