import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { StoriesService } from '../stories/stories.service';

@Public()
@Controller('public/stories')
export class PublicStoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  async list() {
    const stories = await this.storiesService.findActive();

    return stories.map((story) => ({
      id: story.id,
      title: story.title,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType,
      link: story.link,
      createdAt: story.createdAt.toISOString(),
    }));
  }
}
