import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArticleStatus } from '../../../common/enums/article-status.enum';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { ArticleSeo } from './article-seo.entity';

@Entity('articles')
@Index('IDX_articles_status_published_at', ['status', 'publishedAt'])
@Index('IDX_articles_featured', ['featured'])
@Index('IDX_articles_hero', ['hero'])
@Index('IDX_articles_breaking', ['breaking'])
export class Article {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    enumName: 'article_status',
    default: ArticleStatus.Draft,
  })
  status!: ArticleStatus;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ type: 'boolean', default: false })
  breaking!: boolean;

  @Column({ type: 'boolean', default: false })
  hero!: boolean;

  @Column({ name: 'has_video', type: 'boolean', default: false })
  hasVideo!: boolean;

  @Column({ name: 'video_url', type: 'varchar', length: 2048, nullable: true })
  videoUrl!: string | null;

  @Column({ name: 'views_count', type: 'integer', default: 0 })
  viewsCount!: number;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string;

  @ManyToOne(() => User, (user) => user.articles, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => ArticleSeo, (seo) => seo.article, {
    cascade: true,
    eager: false,
  })
  seo?: ArticleSeo | null;

  @ManyToMany(() => Category, (category) => category.articles)
  @JoinTable({
    name: 'article_categories',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories?: Category[];

  @ManyToMany(() => Tag, (tag) => tag.articles)
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: Tag[];
}
