import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';
import { normalizeIranianMobile } from '../../common/utils/iranian-mobile.util';
import { User } from './entities/user.entity';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  normalizeMobileOrThrow(raw: string): string {
    const mobile = normalizeIranianMobile(raw);
    if (!mobile) {
      throw new BadRequestException(
        'شماره موبایل معتبر نیست. فرمت صحیح: 09xxxxxxxxx',
      );
    }
    return mobile;
  }

  async findByMobile(mobileRaw: string): Promise<User | null> {
    const mobile = normalizeIranianMobile(mobileRaw);
    if (!mobile) {
      return null;
    }
    return this.usersRepository.findOne({ where: { mobile } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async listUsers(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async countByRole(role: UserRole): Promise<number> {
    return this.usersRepository.count({ where: { role } });
  }

  async createUser(input: {
    mobile: string;
    password: string;
    displayName: string;
    role: UserRole;
    email?: string | null;
    isActive?: boolean;
  }): Promise<User> {
    const mobile = this.normalizeMobileOrThrow(input.mobile);
    const existing = await this.findByMobile(mobile);
    if (existing) {
      throw new ConflictException('کاربری با این شماره موبایل وجود دارد');
    }

    let email: string | null = null;
    if (input.email?.trim()) {
      email = input.email.trim().toLowerCase();
      const emailOwner = await this.findByEmail(email);
      if (emailOwner) {
        throw new ConflictException('کاربری با این ایمیل وجود دارد');
      }
    }

    if (input.password.length < 8) {
      throw new BadRequestException('رمز عبور باید حداقل ۸ کاراکتر باشد');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = this.usersRepository.create({
      mobile,
      email,
      passwordHash,
      displayName: input.displayName.trim() || mobile,
      role: input.role,
      isActive: input.isActive ?? true,
    });
    return this.usersRepository.save(user);
  }

  /** Create only if mobile does not exist (idempotent seed). */
  async ensureUser(input: {
    mobile: string;
    password: string;
    displayName: string;
    role: UserRole;
  }): Promise<User> {
    const mobile = this.normalizeMobileOrThrow(input.mobile);
    const existing = await this.findByMobile(mobile);
    if (existing) {
      return existing;
    }
    return this.createUser(input);
  }

  async updateUser(
    id: string,
    input: {
      displayName?: string;
      role?: UserRole;
      isActive?: boolean;
      password?: string;
      mobile?: string;
    },
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    if (input.mobile !== undefined) {
      const mobile = this.normalizeMobileOrThrow(input.mobile);
      if (mobile !== user.mobile) {
        const taken = await this.findByMobile(mobile);
        if (taken && taken.id !== id) {
          throw new ConflictException('کاربری با این شماره موبایل وجود دارد');
        }
        user.mobile = mobile;
      }
    }

    if (input.displayName !== undefined) {
      user.displayName = input.displayName.trim() || user.displayName;
    }
    if (input.role !== undefined) {
      user.role = input.role;
    }
    if (input.isActive !== undefined) {
      user.isActive = input.isActive;
    }
    if (input.password !== undefined && input.password.length > 0) {
      if (input.password.length < 8) {
        throw new BadRequestException('رمز عبور باید حداقل ۸ کاراکتر باشد');
      }
      user.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    }

    return this.usersRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    await this.usersRepository.remove(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
