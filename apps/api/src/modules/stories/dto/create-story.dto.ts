import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { StoryMediaType } from '../../../common/enums/story-media-type.enum';

export class CreateStoryDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsUrl({ require_tld: false }, { message: 'mediaUrl must be a valid URL' })
  @MaxLength(2048)
  mediaUrl!: string;

  @IsEnum(StoryMediaType)
  mediaType!: StoryMediaType;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'link must be a valid URL' })
  @MaxLength(2048)
  link?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
