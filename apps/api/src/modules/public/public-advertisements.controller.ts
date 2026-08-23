import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AdvertisementsService } from '../advertisements/advertisements.service';

@Public()
@Controller('public/advertisements')
export class PublicAdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  @Get()
  async list() {
    const ads = await this.advertisementsService.findActivePublic();

    return ads.map((ad) => ({
      id: ad.id,
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      placement: ad.placement,
      slotIndex: ad.slotIndex,
      rotationEnabled: ad.rotationEnabled,
      rotationIntervalSeconds: ad.rotationIntervalSeconds,
    }));
  }
}
