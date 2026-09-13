import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { UserRepository } from './user.repository';
import type {
  ChangePasswordValues,
  CreateUserInput,
  CreateUserResponseDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UserDataFieldDto,
  User,
} from '@packages/entities/user';
import { checkUuidValid, compareData, hashData } from '@packages/helpers';
import { ERROR_MESSAGES } from 'src/data/constants';

function generateUserCode(): string {
  return randomBytes(3).toString('hex').slice(0, 6).toUpperCase();
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly searchableFields = ['id', 'email', 'username', 'phone', 'userCode'] as const;

  constructor(private readonly userRepo: UserRepository) {}

  // TODO: generate unique username from first/last name
  async generateUsername(firstName: string, lastName: string): Promise<string> {
    const baseUsername = `${lastName}${firstName}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

    for (let i = 0; i < 10; i++) {
      const candidate = i === 0 ? baseUsername : `${baseUsername}${i}`;
      const existing = await this.getUserByField({ field: 'username', value: candidate });
      if (existing.length === 0) return candidate;
    }

    throw new ConflictException(
      `${ERROR_MESSAGES.UNABLE_TO_GENERATE_USERNAME} for "${firstName} ${lastName}" after 10 attempts`,
    );
  }

  // TODO: get and filter users, paginated
  async getUsersService(query: GetUsersQueryDto) {
    const { page, limit } = query;
    const offset = (page - 1) * limit;
    const whereClause = this.userRepo.buildUserListConditions(query);

    const [total, rows] = await Promise.all([
      this.userRepo.countUsers(whereClause),
      this.userRepo.paginateUsers(whereClause, limit, offset),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const data = rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: `${row.firstName} ${row.lastName}`.trim(),
      role: row.role ?? 'STUDENT',
      status: row.isActive === true ? 'active' : 'inactive',
      createdAt:
        row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    }));

    return {
      data,
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages,
      },
    };
  }

  // TODO: get detail user by id
  async getDetailUserService({ id }: { id: string }): Promise<Omit<User, 'password'> | null> {
    if (!id || !checkUuidValid({ data: id }))
      throw new BadRequestException(ERROR_MESSAGES.USER_ID_MUST_BE_UUID);
    const user = await this.userRepo.findById(id);
    if (!user) return null;
    const safeUser: Partial<Pick<User, 'password'>> & Omit<User, 'password'> = { ...user };
    delete safeUser.password;
    return safeUser;
  }

  // TODO: get users by searchable field
  async getUserByField(userDataFieldDto: UserDataFieldDto): Promise<User[]> {
    if (
      !this.searchableFields.includes(
        userDataFieldDto.field as (typeof this.searchableFields)[number],
      )
    ) {
      this.logger.warn(`Status: 400 - Unsupported field: ${userDataFieldDto.field}`);
      throw new BadRequestException(
        `${ERROR_MESSAGES.UNSUPPORTED_FIELD}: ${userDataFieldDto.field}`,
      );
    }

    const users = await this.userRepo.findByField(userDataFieldDto.field, userDataFieldDto.value);
    return users.map((user) => ({ ...user, role: user.role ?? 'STUDENT' }));
  }

  // TODO: create user, check email/username uniqueness
  async createUserService(createUserDto: CreateUserInput): Promise<CreateUserResponseDto> {
    const { email, firstName, lastName, password, username } = createUserDto;
    let resolvedUsername = username?.trim();

    const [existingByEmail, existingByUsername] = await Promise.all([
      this.getUserByField({ field: 'email', value: email }),
      resolvedUsername && this.getUserByField({ field: 'username', value: resolvedUsername }),
    ]);

    if (existingByEmail.length > 0) {
      this.logger.warn(`Status: 400 - Email already exists: ${email}`);
      throw new BadRequestException(`${ERROR_MESSAGES.EMAIL_EXISTS}: ${email}`);
    }
    if (Array.isArray(existingByUsername) && existingByUsername.length > 0) {
      this.logger.warn(`Status: 400 - Username already exists: ${resolvedUsername}`);
      throw new BadRequestException(`${ERROR_MESSAGES.USERNAME_EXISTS}: ${resolvedUsername}`);
    }

    const id = randomUUID();
    const hashedPassword = await hashData(password);
    const role = createUserDto.role ?? 'STUDENT';
    let userCode: string | undefined;
    if (role === 'TUTOR') {
      userCode = generateUserCode();
      for (let i = 0; i < 5; i++) {
        const existing = await this.userRepo.findUserCode(userCode);
        if (!existing) break;
        userCode = generateUserCode();
      }
    }

    if (!username) {
      resolvedUsername = await this.generateUsername(firstName, lastName);
    }

    const user = await this.userRepo.create({
      id,
      ...(userCode ? { userCode } : {}),
      email,
      username: resolvedUsername!,
      firstName,
      lastName,
      password: hashedPassword,
      role,
    });

    return {
      message: 'User created successfully',
      data: {
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        password: user.password,
      },
    };
  }

  // TODO: update user password by id
  async updateUserPasswordService({ id, password }: { id: string; password: string }) {
    if (!id || !checkUuidValid({ data: id }))
      throw new BadRequestException(ERROR_MESSAGES.USER_ID_MUST_BE_UUID);

    const [user] = await this.getUserByField({
      field: 'id',
      value: id,
    });
    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const hashedPassword = await hashData(password);
    return this.userRepo.updatePassword(id, hashedPassword);
  }

  // TODO: update user fields by id
  async updateUserService({ id, data }: { id: string; data: UpdateUserDto }) {
    if (!id || !checkUuidValid({ data: id }))
      throw new BadRequestException(ERROR_MESSAGES.USER_ID_MUST_BE_UUID);

    const [user] = await this.getUserByField({
      field: 'id',
      value: id,
    });
    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return this.userRepo.update(id, data);
  }

  /**
   * Self-update (`PUT /users`, acting user editing their own profile). A STUDENT may
   * not change their own `firstName`/`lastName` — only admin (`/admin/students/:id`)
   * is allowed to rename a student.
   */
  async updateOwnProfileService({
    id,
    role,
    data,
  }: {
    id: string;
    role: string;
    data: UpdateUserDto;
  }) {
    if (role === 'STUDENT' && (data.firstName !== undefined || data.lastName !== undefined)) {
      throw new BadRequestException(ERROR_MESSAGES.STUDENT_CANNOT_UPDATE_NAME);
    }

    return this.updateUserService({ id, data });
  }

  // TODO: toggle user active status by id
  async updateStatusUserService({ id }: { id: string }) {
    if (!id || !checkUuidValid({ data: id }))
      throw new BadRequestException(ERROR_MESSAGES.USER_ID_MUST_BE_UUID);

    const [user] = await this.getUserByField({
      field: 'id',
      value: id,
    });
    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return this.userRepo.update(id, { isActive: !user.isActive });
  }

  // TODO: delete user by id, admin only
  async deleteUserByAdminService({ id }: { id: string }) {
    if (!id || !checkUuidValid({ data: id }))
      throw new BadRequestException(ERROR_MESSAGES.USER_ID_MUST_BE_UUID);

    const [user] = await this.getUserByField({
      field: 'id',
      value: id,
    });
    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    await this.userRepo.delete(id);
    return { id };
  }

  // TODO: change password, verify current password first
  async changePasswordService(userId: string, dto: ChangePasswordValues) {
    const user = await this.userRepo.findWithPassword(userId);
    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const isMatch = await compareData(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT);
    }

    await this.updateUserPasswordService({ id: userId, password: dto.newPassword });
    return { message: 'Password changed successfully' };
  }
}
