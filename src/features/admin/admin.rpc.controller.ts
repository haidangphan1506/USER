import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type {
  CreateManagedUserDto,
  ListManagedUsersQueryDto,
  UpdateManagedStudentDto,
  UpdateManagedUserDto,
} from '@packages/entities/admin';
import { RpcExceptionFilter } from '@packages/filters';
import { AdminService } from './admin.service';

/** Message-pattern mirror of `AdminController`, reached over RabbitMQ (`user_queue`). */
@UseFilters(RpcExceptionFilter)
@Controller()
export class AdminRpcController {
  constructor(private readonly adminService: AdminService) {}

  @MessagePattern('admin.createTutor')
  createTutor(@Payload() dto: CreateManagedUserDto) {
    return this.adminService.createTutor(dto);
  }

  @MessagePattern('admin.listTutors')
  listTutors(@Payload() query: ListManagedUsersQueryDto) {
    return this.adminService.listTutors(query);
  }

  @MessagePattern('admin.getTutor')
  getTutor(@Payload() payload: { id: string }) {
    return this.adminService.getTutor(payload.id);
  }

  @MessagePattern('admin.updateTutor')
  updateTutor(@Payload() payload: { id: string; data: UpdateManagedUserDto }) {
    return this.adminService.updateTutor(payload.id, payload.data);
  }

  @MessagePattern('admin.deleteTutor')
  deleteTutor(@Payload() payload: { id: string }) {
    return this.adminService.deleteTutor(payload.id);
  }

  @MessagePattern('admin.createStudent')
  createStudent(@Payload() dto: CreateManagedUserDto) {
    return this.adminService.createStudent(dto);
  }

  @MessagePattern('admin.listStudents')
  listStudents(@Payload() query: ListManagedUsersQueryDto) {
    return this.adminService.listStudents(query);
  }

  @MessagePattern('admin.getStudent')
  getStudent(@Payload() payload: { id: string }) {
    return this.adminService.getStudent(payload.id);
  }

  @MessagePattern('admin.updateStudent')
  updateStudent(@Payload() payload: { id: string; data: UpdateManagedStudentDto }) {
    return this.adminService.updateStudent(payload.id, payload.data);
  }

  @MessagePattern('admin.deleteStudent')
  deleteStudent(@Payload() payload: { id: string }) {
    return this.adminService.deleteStudent(payload.id);
  }
}
