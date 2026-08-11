import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import {
  PaginatedPublicArticlesDto,
  PublicArticleDetailDto,
} from './dto/public-article-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PublicArticlesQueryDto } from './dto/public-articles-query.dto';
import { PublicArticlesService } from './public-articles.service';

@Public()
@Controller('public/articles')
export class PublicArticlesController {
  constructor(private readonly publicArticlesService: PublicArticlesService) {}

  @Get('latest')
  findLatest(@Query() query: PublicArticlesQueryDto): Promise<PaginatedPublicArticlesDto> {
    return this.publicArticlesService.findLatest(query);
  }

  @Get('featured')
  findFeatured(@Query() query: PaginationQueryDto): Promise<PaginatedPublicArticlesDto> {
    return this.publicArticlesService.findFeatured(query);
  }

  @Get('hero')
  findHero(@Query() query: PaginationQueryDto): Promise<PaginatedPublicArticlesDto> {
    return this.publicArticlesService.findHero(query);
  }

  @Get('breaking')
  findBreaking(@Query() query: PaginationQueryDto): Promise<PaginatedPublicArticlesDto> {
    return this.publicArticlesService.findBreaking(query);
  }

  @Get(':slugOrId')
  async findBySlugOrId(@Param('slugOrId') slugOrId: string): Promise<PublicArticleDetailDto> {
    // If it's an integer (ex: /public/articles/123), treat it as `id`.
    if (/^\d+$/.test(slugOrId)) {
      return this.publicArticlesService.findById(Number(slugOrId));
    }

    return this.publicArticlesService.findBySlug(slugOrId);
  }
}
