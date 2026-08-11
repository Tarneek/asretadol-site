import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity('article_seo')
export class ArticleSeo {
  @PrimaryColumn({ name: 'article_id', type: 'integer' })
  articleId!: number;

  @OneToOne(() => Article, (article) => article.seo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article!: Article;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle!: string | null;

  @Column({ name: 'meta_description', type: 'varchar', length: 500, nullable: true })
  metaDescription!: string | null;

  @Column({ name: 'og_image_url', type: 'varchar', length: 2048, nullable: true })
  ogImageUrl!: string | null;

  @Column({ name: 'canonical_url', type: 'varchar', length: 2048, nullable: true })
  canonicalUrl!: string | null;
}
