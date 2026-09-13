import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type {
  ChangePasswordValues,
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UserDataFieldDto,
} from '@packages/entities/user';
import { RpcExceptionFilter } from '@packages/filters';
import type { JwtUserRole } from '@packages/helpers';
import { UserService } from './user.service';

/** Message-pattern mirror of `UserController`, reached over RabbitMQ (`user_queue`). */
@UseFilters(RpcExceptionFilter)
@Controller()
export class UserRpcController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.getUsers')
  getUsers(@Payload() query: GetUsersQueryDto) {
    return this.userService.getUsersService(query);
  }

  @MessagePattern('user.getDetailUser')
  getDetailUser(@Payload() payload: { userId: string }) {
    return this.userService.getDetailUserService({ id: payload.userId });
  }

  @MessagePattern('user.getUserByField')
  getUserByField(@Payload() dataFieldDto: UserDataFieldDto) {
    return this.userService.getUserByField(dataFieldDto);
  }

  @MessagePattern('user.createUser')
  createUser(@Payload() createUserDto: CreateUserDto) {
    return this.userService.createUserService(createUserDto);
  }

  @MessagePattern('user.updateUser')
  updateUser(@Payload() payload: { id: string; role: JwtUserRole; data: UpdateUserDto }) {
    return this.userService.updateOwnProfileService(payload);
  }

  @MessagePattern('user.updateUserByAdmin')
  updateUserByAdmin(@Payload() payload: { id: string; data: UpdateUserDto }) {
    return this.userService.updateUserService(payload);
  }

  @MessagePattern('user.updateStatusUser')
  updateStatusUser(@Payload() payload: { id: string }) {
    return this.userService.updateStatusUserService(payload);
  }

  @MessagePattern('user.deleteUserByAdmin')
  deleteUserByAdmin(@Payload() payload: { id: string }) {
    return this.userService.deleteUserByAdminService(payload);
  }

  @MessagePattern('user.changePassword')
  changePassword(@Payload() payload: { userId: string; data: ChangePasswordValues }) {
    return this.userService.changePasswordService(payload.userId, payload.data);
  }
}
