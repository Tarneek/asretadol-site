import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Story } from './entities/story.entity';
import {
  normalizeStoryLink,
  normalizeStoryMediaUrl,
} from './story-media.util';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private readonly storiesRepository: Repository<Story>,
  ) {}

  async findAll(): Promise<Story[]> {
    return this.storiesRepository.find({
      order: { isActive: 'DESC', createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Story[]> {
    return this.storiesRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Story> {
    const story = await this.storiesRepository.findOne({ where: { id } });
    if (!story) {
      throw new NotFoundException(`Story ${id} not found`);
    }
    return story;
  }

  async create(dto: CreateStoryDto): Promise<Story> {
    const story = this.storiesRepository.create({
      title: dto.title.trim(),
      mediaUrl: normalizeStoryMediaUrl(dto.mediaUrl, dto.mediaType),
      mediaType: dto.mediaType,
      link: normalizeStoryLink(dto.link),
      isActive: dto.isActive ?? true,
    });

    return this.storiesRepository.save(story);
  }

  async update(id: string, dto: UpdateStoryDto): Promise<Story> {
    const story = await this.findOne(id);
    const nextMediaType = dto.mediaType ?? story.mediaType;

    if (dto.title !== undefined) {
      story.title = dto.title.trim();
    }
    if (dto.mediaUrl !== undefined) {
      const nextUrl = dto.mediaUrl.trim();
      // Keep an already-stored URL even if legacy; only re-validate new values.
      if (nextUrl === story.mediaUrl.trim()) {
        story.mediaUrl = nextUrl;
      } else {
        story.mediaUrl = normalizeStoryMediaUrl(nextUrl, nextMediaType);
      }
    } else if (dto.mediaType !== undefined && dto.mediaType !== story.mediaType) {
      // Type changed without a new file — re-check the existing path for the new type.
      story.mediaUrl = normalizeStoryMediaUrl(story.mediaUrl, dto.mediaType);
    }
    if (dto.mediaType !== undefined) {
      story.mediaType = dto.mediaType;
    }
    if (dto.link !== undefined) {
      story.link = normalizeStoryLink(dto.link);
    }
    if (dto.isActive !== undefined) {
      story.isActive = dto.isActive;
    }

    return this.storiesRepository.save(story);
  }

  async remove(id: string): Promise<void> {
    const story = await this.findOne(id);
    await this.storiesRepository.remove(story);
  }
}
