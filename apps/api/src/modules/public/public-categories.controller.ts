import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PublicCategoryArticlesDto } from './dto/public-article-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PublicArticlesService } from './public-articles.service';
import { PublicTaxonomyService } from './public-taxonomy.service';

@Public()
@Controller('public/categories')
export class PublicCategoriesController {
  constructor(
    private readonly publicArticlesService: PublicArticlesService,
    private readonly taxonomyService: PublicTaxonomyService,
  ) {}

  @Get()
  list() {
    return this.taxonomyService.listCategories();
  }

  @Get(':slug/articles')
  findArticlesByCategory(
    @Param('slug') slug: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PublicCategoryArticlesDto> {
    return this.publicArticlesService.findByCategorySlug(slug, query);
  }
}
