import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { StoryMediaType } from '../../../common/enums/story-media-type.enum';

export class UpdateStoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  mediaUrl?: string;

  @IsOptional()
  @IsEnum(StoryMediaType)
  mediaType?: StoryMediaType;

  /** Destination URL — optional; empty/null clears the link. */
  @IsOptional()
  @ValidateIf((_, value) => typeof value === 'string' && value.trim().length > 0)
  @IsUrl({ require_tld: false }, { message: 'link must be a valid URL' })
  @MaxLength(2048)
  link?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
