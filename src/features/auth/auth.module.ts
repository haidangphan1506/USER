import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthRpcController } from './auth.rpc.controller';
import { AuthService } from './auth.service';
import { LoginService } from './login.service';
import { getJwtModuleOptionsFromConfig } from '@packages/configs/jwt-sign.config';
import { FacebookStrategy, GoogleStrategy } from '@packages/strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getJwtModuleOptionsFromConfig(configService),
    }),
  ],
  controllers: [AuthController, AuthRpcController],
  providers: [AuthService, LoginService, GoogleStrategy, FacebookStrategy],
  exports: [AuthService, LoginService],
})
export class AuthModule {}
