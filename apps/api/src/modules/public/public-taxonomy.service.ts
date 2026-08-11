import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';

@Injectable()
export class PublicTaxonomyService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async listCategories(): Promise<
    Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      sortOrder: number;
    }>
  > {
    const categories = await this.categoriesRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
    }));
  }

  async listTags(): Promise<Array<{ id: string; name: string; slug: string }>> {
    const tags = await this.tagsRepository.find({
      order: { name: 'ASC' },
    });

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    }));
  }
}
