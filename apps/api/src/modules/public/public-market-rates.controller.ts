import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { MarketRatesService } from '../market/market-rates.service';

@Public()
@Controller('public/market-rates')
export class PublicMarketRatesController {
  constructor(private readonly marketRatesService: MarketRatesService) {}

  @Get()
  async list() {
    return this.marketRatesService.findAllPublic();
  }
}
