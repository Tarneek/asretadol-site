import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AdPlacement } from '../../../common/enums/ad-placement.enum';

export class CreateAdvertisementDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(2048)
  imageUrl!: string;

  @IsUrl({ require_tld: false }, { message: 'linkUrl must be a valid URL' })
  @MaxLength(2048)
  linkUrl!: string;

  @IsEnum(AdPlacement)
  placement!: AdPlacement;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  slotIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  rotationEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(120)
  rotationIntervalSeconds?: number;

  @IsOptional()
  @IsString()
  startsAt?: string | null;

  @IsOptional()
  @IsString()
  endsAt?: string | null;
}
