import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StoryMediaType } from '../../../common/enums/story-media-type.enum';

@Entity('stories')
@Index('IDX_stories_is_active_created_at', ['isActive', 'createdAt'])
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ name: 'media_url', type: 'varchar', length: 2048 })
  mediaUrl!: string;

  @Column({
    name: 'media_type',
    type: 'enum',
    enum: StoryMediaType,
    enumName: 'story_media_type',
  })
  mediaType!: StoryMediaType;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  link!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
