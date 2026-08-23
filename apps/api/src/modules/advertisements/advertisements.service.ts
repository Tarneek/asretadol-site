import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  normalizeAdvertisementImagePath,
  parseOptionalDate,
} from './ad-media.util';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { Advertisement } from './entities/advertisement.entity';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private readonly advertisementsRepository: Repository<Advertisement>,
  ) {}

  async findAll(): Promise<Advertisement[]> {
    return this.advertisementsRepository.find({
      order: {
        placement: 'ASC',
        slotIndex: 'ASC',
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findActivePublic(now = new Date()): Promise<Advertisement[]> {
    const ads = await this.advertisementsRepository.find({
      where: { isActive: true },
      order: {
        placement: 'ASC',
        slotIndex: 'ASC',
        sortOrder: 'ASC',
        createdAt: 'ASC',
      },
    });

    return ads.filter((ad) => this.isScheduled(ad, now));
  }

  async findOne(id: string): Promise<Advertisement> {
    const ad = await this.advertisementsRepository.findOne({ where: { id } });
    if (!ad) {
      throw new NotFoundException(`Advertisement ${id} not found`);
    }
    return ad;
  }

  async create(dto: CreateAdvertisementDto): Promise<Advertisement> {
    const startsAt = parseOptionalDate(dto.startsAt ?? null);
    const endsAt = parseOptionalDate(dto.endsAt ?? null);
    this.assertValidSchedule(startsAt, endsAt);

    const ad = this.advertisementsRepository.create({
      title: dto.title.trim(),
      imageUrl: normalizeAdvertisementImagePath(dto.imageUrl),
      linkUrl: dto.linkUrl.trim(),
      placement: dto.placement,
      slotIndex: dto.slotIndex ?? 0,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      rotationEnabled: dto.rotationEnabled ?? true,
      rotationIntervalSeconds: dto.rotationIntervalSeconds ?? 8,
      startsAt,
      endsAt,
    });

    return this.advertisementsRepository.save(ad);
  }

  async update(id: string, dto: UpdateAdvertisementDto): Promise<Advertisement> {
    const ad = await this.findOne(id);

    const startsAt =
      dto.startsAt !== undefined ? parseOptionalDate(dto.startsAt) : ad.startsAt;
    const endsAt = dto.endsAt !== undefined ? parseOptionalDate(dto.endsAt) : ad.endsAt;
    this.assertValidSchedule(startsAt, endsAt);

    if (dto.title !== undefined) {
      ad.title = dto.title.trim();
    }
    if (dto.imageUrl !== undefined) {
      ad.imageUrl = normalizeAdvertisementImagePath(dto.imageUrl);
    }
    if (dto.linkUrl !== undefined) {
      ad.linkUrl = dto.linkUrl.trim();
    }
    if (dto.placement !== undefined) {
      ad.placement = dto.placement;
    }
    if (dto.slotIndex !== undefined) {
      ad.slotIndex = dto.slotIndex;
    }
    if (dto.sortOrder !== undefined) {
      ad.sortOrder = dto.sortOrder;
    }
    if (dto.isActive !== undefined) {
      ad.isActive = dto.isActive;
    }
    if (dto.rotationEnabled !== undefined) {
      ad.rotationEnabled = dto.rotationEnabled;
    }
    if (dto.rotationIntervalSeconds !== undefined) {
      ad.rotationIntervalSeconds = dto.rotationIntervalSeconds;
    }
    ad.startsAt = startsAt;
    ad.endsAt = endsAt;

    return this.advertisementsRepository.save(ad);
  }

  async remove(id: string): Promise<void> {
    const ad = await this.findOne(id);
    await this.advertisementsRepository.remove(ad);
  }

  private isScheduled(ad: Advertisement, now: Date): boolean {
    if (ad.startsAt && ad.startsAt.getTime() > now.getTime()) {
      return false;
    }
    if (ad.endsAt && ad.endsAt.getTime() < now.getTime()) {
      return false;
    }
    return true;
  }

  private assertValidSchedule(startsAt: Date | null, endsAt: Date | null): void {
    if (startsAt && endsAt && endsAt.getTime() < startsAt.getTime()) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
  }
}
