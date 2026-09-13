import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { CreateStudentDto, GetStudentsQueryDto, UpdateStudentDto } from '@packages/entities/student';
import { RpcExceptionFilter } from '@packages/filters';
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
import { StudentService } from './student.service';

/** Message-pattern mirror of `StudentController`, reached over RabbitMQ (`user_queue`). */
@UseFilters(RpcExceptionFilter)
@Controller()
export class StudentRpcController {
  constructor(private readonly studentService: StudentService) {}

  @MessagePattern('student.getStudentCode')
  generateStudentCode() {
    return this.studentService.generateStudentCodeService();
  }

  @MessagePattern('student.create')
  create(@Payload() payload: { data: CreateStudentDto; currentUser: JwtGuardUser }) {
    return this.studentService.create(payload.data, payload.currentUser);
  }

  @MessagePattern('student.getAll')
  getAll(@Payload() query: GetStudentsQueryDto) {
    return this.studentService.findAll(query);
  }

  @MessagePattern('student.findById')
  findById(@Payload() payload: { id: string }) {
    return this.studentService.findById(payload.id);
  }

  @MessagePattern('student.update')
  update(@Payload() payload: { id: string; data: UpdateStudentDto }) {
    return this.studentService.update(payload.id, payload.data);
  }

  @MessagePattern('student.delete')
  delete(@Payload() payload: { id: string }) {
    return this.studentService.delete(payload.id);
  }
}
