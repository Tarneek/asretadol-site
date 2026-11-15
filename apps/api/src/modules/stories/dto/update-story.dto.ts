import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator';
import { StoryMediaType } from '../../../common/enums/story-media-type.enum';
import { IsStoryLinkConstraint } from './create-story.dto';

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

  /** Destination URL or site-relative path — optional; empty/null clears the link. */
  @IsOptional()
  @Validate(IsStoryLinkConstraint)
  @MaxLength(2048)
  link?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
