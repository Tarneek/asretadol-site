import { Transform } from 'class-transformer';
import { Matches, IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  IRANIAN_MOBILE_REGEX,
  normalizeIranianMobile,
} from '../../../common/utils/iranian-mobile.util';

export class LoginDto {
  @Transform(({ value }) => normalizeIranianMobile(String(value ?? '')) ?? String(value ?? '').trim())
  @IsString()
  @IsNotEmpty()
  @Matches(IRANIAN_MOBILE_REGEX, {
    message: 'mobile must be a valid Iranian mobile number (09xxxxxxxxx)',
  })
  mobile!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password!: string;
}
