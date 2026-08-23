import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { Advertisement } from './entities/advertisement.entity';

@Controller('advertisements')
@Roles(UserRole.Admin, UserRole.Editor, UserRole.Author)
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  @Get()
  findAll(): Promise<Advertisement[]> {
    return this.advertisementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Advertisement> {
    return this.advertisementsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.Editor)
  create(@Body() dto: CreateAdvertisementDto): Promise<Advertisement> {
    return this.advertisementsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.Editor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdvertisementDto,
  ): Promise<Advertisement> {
    return this.advertisementsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.Editor)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.advertisementsService.remove(id);
  }
}
