import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { StoryMediaType } from '../../../common/enums/story-media-type.enum';
import { isValidStoryLink } from '../story-media.util';

@ValidatorConstraint({ name: 'isStoryLink', async: false })
export class IsStoryLinkConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return true;
    }
    return typeof value === 'string' && isValidStoryLink(value);
  }

  defaultMessage(): string {
    return 'link must be a valid URL (https://...) or a site path starting with /';
  }
}

export class CreateStoryDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(2048)
  mediaUrl!: string;

  @IsEnum(StoryMediaType)
  mediaType!: StoryMediaType;

  /** Destination URL or site-relative path — optional; empty/null is allowed. */
  @IsOptional()
  @Validate(IsStoryLinkConstraint)
  @MaxLength(2048)
  link?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
