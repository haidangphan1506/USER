import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type {
  ForgotPasswordDto,
  LoginByUserCodeDto,
  LoginDto,
  RefreshTokenBodyDto,
  RegisterDto,
  ResetPasswordDto,
} from '@packages/entities/auth';
import { RpcExceptionFilter } from '@packages/filters';
import type { FacebookProfile, GoogleProfile } from '@packages/strategy';
import { AuthService } from './auth.service';

/**
 * Message-pattern mirror of `AuthController` — reached only by the gateway's `USER_SERVICE`
 * `ClientProxy` over RabbitMQ (RMQ transport, `user_queue`). Delegates to the same,
 * unmodified `AuthService` the HTTP controller uses; no business logic lives here.
 */
@UseFilters(RpcExceptionFilter)
@Controller()
export class AuthRpcController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  register(@Payload() registerDto: RegisterDto) {
    return this.authService.registerService(registerDto);
  }

  @MessagePattern('auth.login')
  login(@Payload() loginDto: LoginDto) {
    return this.authService.loginService(loginDto);
  }

  @MessagePattern('auth.loginByUserCode')
  loginByUserCode(@Payload() dto: LoginByUserCodeDto) {
    return this.authService.loginByUserCodeService(dto);
  }

  @MessagePattern('auth.refresh')
  refresh(@Payload() body: RefreshTokenBodyDto) {
    return this.authService.refreshTokens(body);
  }

  @MessagePattern('auth.forgotPassword')
  forgotPassword(@Payload() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPasswordService(forgotPasswordDto);
  }

  @MessagePattern('auth.resetPassword')
  resetPassword(@Payload() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPasswordService(resetPasswordDto);
  }

  @MessagePattern('auth.googleLogin')
  googleLogin(@Payload() profile: GoogleProfile) {
    return this.authService.googleLoginService(profile);
  }

  @MessagePattern('auth.facebookLogin')
  facebookLogin(@Payload() profile: FacebookProfile) {
    return this.authService.facebookLoginService(profile);
  }
}
