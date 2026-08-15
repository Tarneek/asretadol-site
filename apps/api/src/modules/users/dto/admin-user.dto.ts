import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';
import {
  IRANIAN_MOBILE_REGEX,
  normalizeIranianMobile,
} from '../../../common/utils/iranian-mobile.util';

export class CreateUserDto {
  @Transform(({ value }) => normalizeIranianMobile(String(value ?? '')) ?? String(value ?? '').trim())
  @IsString()
  @IsNotEmpty()
  @Matches(IRANIAN_MOBILE_REGEX, {
    message: 'mobile must be a valid Iranian mobile number (09xxxxxxxxx)',
  })
  mobile!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : normalizeIranianMobile(String(value)) ?? String(value).trim(),
  )
  @IsString()
  @Matches(IRANIAN_MOBILE_REGEX, {
    message: 'mobile must be a valid Iranian mobile number (09xxxxxxxxx)',
  })
  mobile?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
