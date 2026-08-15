import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  ForbiddenException,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateUserDto, UpdateUserDto } from './dto/admin-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

function toProfile(user: User): UserProfileDto {
  return {
    id: user.id,
    mobile: user.mobile,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() currentUser: AuthenticatedUser): Promise<UserProfileDto> {
    const user = await this.usersService.findById(currentUser.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return toProfile(user);
  }

  @Get()
  @Roles(UserRole.Admin)
  async listUsers(): Promise<UserProfileDto[]> {
    const users = await this.usersService.listUsers();
    return users.map(toProfile);
  }

  @Post()
  @Roles(UserRole.Admin)
  async createUser(@Body() dto: CreateUserDto): Promise<UserProfileDto> {
    const user = await this.usersService.createUser({
      mobile: dto.mobile,
      password: dto.password,
      displayName: dto.displayName?.trim() || dto.mobile,
      role: dto.role ?? UserRole.Author,
      isActive: dto.isActive ?? true,
    });
    return toProfile(user);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    const user = await this.usersService.updateUser(id, {
      mobile: dto.mobile,
      password: dto.password,
      displayName: dto.displayName,
      role: dto.role,
      isActive: dto.isActive,
    });
    return toProfile(user);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    if (currentUser.id === id) {
      throw new ForbiddenException('نمی‌توانید حساب خودتان را حذف کنید');
    }
    await this.usersService.deleteUser(id);
  }
}
