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
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Story } from './entities/story.entity';
import { StoriesService } from './stories.service';

@Controller('stories')
@Roles(UserRole.Admin, UserRole.Editor, UserRole.Author)
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  findAll(): Promise<Story[]> {
    return this.storiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Story> {
    return this.storiesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.Editor)
  create(@Body() dto: CreateStoryDto): Promise<Story> {
    return this.storiesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.Editor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoryDto,
  ): Promise<Story> {
    return this.storiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.Editor)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.storiesService.remove(id);
  }
}
