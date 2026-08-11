import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PublicTagArticlesDto } from './dto/public-article-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PublicArticlesService } from './public-articles.service';
import { PublicTaxonomyService } from './public-taxonomy.service';

@Public()
@Controller('public/tags')
export class PublicTagsController {
  constructor(
    private readonly publicArticlesService: PublicArticlesService,
    private readonly taxonomyService: PublicTaxonomyService,
  ) {}

  @Get()
  list() {
    return this.taxonomyService.listTags();
  }

  @Get(':slug/articles')
  findArticlesByTag(
    @Param('slug') slug: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PublicTagArticlesDto> {
    return this.publicArticlesService.findByTagSlug(slug, query);
  }
}
