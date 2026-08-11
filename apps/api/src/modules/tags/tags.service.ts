import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../common/utils/slug.util';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag ${id} not found`);
    }
    return tag;
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const slug = await this.resolveUniqueSlug(dto.slug ?? dto.name);
    const tag = this.tagsRepository.create({
      name: dto.name.trim(),
      slug,
    });
    return this.tagsRepository.save(tag);
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    if (dto.name !== undefined) {
      tag.name = dto.name.trim();
    }

    if (dto.slug !== undefined) {
      tag.slug = await this.resolveUniqueSlug(dto.slug, id);
    } else if (dto.name !== undefined) {
      tag.slug = await this.resolveUniqueSlug(dto.name, id);
    }

    return this.tagsRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagsRepository.remove(tag);
  }

  private async resolveUniqueSlug(raw: string, excludeId?: string): Promise<string> {
    const base = slugify(raw);
    if (!base) {
      throw new BadRequestException('Unable to generate a valid slug');
    }

    let candidate = base;
    let suffix = 2;

    while (await this.slugExists(candidate, excludeId)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.tagsRepository
      .createQueryBuilder('tag')
      .where('tag.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('tag.id != :excludeId', { excludeId });
    }

    return (await qb.getCount()) > 0;
  }
}
