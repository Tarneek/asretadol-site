import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PublicSearchResultDto } from './dto/public-article-response.dto';
import { PublicSearchQueryDto } from './dto/public-search-query.dto';
import { PublicArticlesService } from './public-articles.service';

@Public()
@Controller('public/search')
export class PublicSearchController {
  constructor(private readonly publicArticlesService: PublicArticlesService) {}

  @Get()
  search(@Query() query: PublicSearchQueryDto): Promise<PublicSearchResultDto> {
    return this.publicArticlesService.search(query);
  }
}
