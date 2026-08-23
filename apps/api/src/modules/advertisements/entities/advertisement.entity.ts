import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdPlacement } from '../../../common/enums/ad-placement.enum';

@Entity('advertisements')
export class Advertisement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 2048 })
  imageUrl!: string;

  @Column({ name: 'link_url', type: 'varchar', length: 2048 })
  linkUrl!: string;

  @Column({ type: 'enum', enum: AdPlacement, enumName: 'ad_placement' })
  placement!: AdPlacement;

  @Column({ name: 'slot_index', type: 'smallint', default: 0 })
  slotIndex!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'rotation_enabled', type: 'boolean', default: true })
  rotationEnabled!: boolean;

  @Column({ name: 'rotation_interval_seconds', type: 'int', default: 8 })
  rotationIntervalSeconds!: number;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt!: Date | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
