import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { File as MulterFile } from 'multer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { ArticlesService } from './articles.service';
import { ArticleViewAnalyticsService } from './article-view-analytics.service';
import { ArticleMediaService } from './article-media.service';
import { ARTICLE_IMAGE_MULTER_OPTIONS } from './article-image-upload.options';
import { ARTICLE_VIDEO_MULTER_OPTIONS } from './article-video-upload.options';
import {
  ArticleResponseDto,
  PaginatedArticlesDto,
} from './dto/article-response.dto';
import { ArticleDashboardStatsDto } from './dto/article-dashboard-stats.dto';
import { ArticleViewsChartDto } from './dto/article-views-chart.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { SetFeaturedDto } from './dto/set-featured.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleImageUploadResponseDto } from './dto/article-image-upload-response.dto';

@Controller('articles')
@Roles(UserRole.Admin, UserRole.Editor, UserRole.Author)
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly viewAnalytics: ArticleViewAnalyticsService,
    private readonly articleMedia: ArticleMediaService,
  ) {}

  @Post('media/upload')
  @UseInterceptors(FileInterceptor('file', ARTICLE_IMAGE_MULTER_OPTIONS))
  uploadFeaturedImage(
    @UploadedFile() file: MulterFile | undefined,
  ): ArticleImageUploadResponseDto {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }
    return { path: this.articleMedia.buildPublicPath(file.filename) };
  }

  @Post('media/upload-video')
  @UseInterceptors(FileInterceptor('file', ARTICLE_VIDEO_MULTER_OPTIONS))
  uploadArticleVideo(
    @UploadedFile() file: MulterFile | undefined,
  ): ArticleImageUploadResponseDto {
    if (!file) {
      throw new BadRequestException('Video file is required.');
    }
    return { path: this.articleMedia.buildVideoPublicPath(file.filename) };
  }

  @Post()
  create(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.create(dto, user);
  }

  @Get()
  findAll(
    @Query() query: ListArticlesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedArticlesDto> {
    return this.articlesService.findAll(query, user);
  }

  @Get('stats/views-chart')
  @Roles(UserRole.Admin, UserRole.Editor)
  getViewsChart(@Query('days') days?: string): Promise<ArticleViewsChartDto> {
    const parsed = Number(days);
    return this.viewAnalytics.getViewsChart(Number.isFinite(parsed) && parsed > 0 ? parsed : 14);
  }

  @Get('stats')
  @Roles(UserRole.Admin, UserRole.Editor)
  getStats(): Promise<ArticleDashboardStatsDto> {
    return this.articlesService.getDashboardStats();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.findOneForUser(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.update(id, dto, user);
  }

  @Post(':id/publish')
  @Roles(UserRole.Admin, UserRole.Editor)
  publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.publish(id, user);
  }

  @Post(':id/archive')
  @Roles(UserRole.Admin, UserRole.Editor)
  archive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.archive(id, user);
  }

  @Post(':id/unarchive')
  @Roles(UserRole.Admin, UserRole.Editor)
  unarchive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.unarchive(id, user);
  }

  @Patch(':id/featured')
  @Roles(UserRole.Admin, UserRole.Editor)
  setFeatured(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetFeaturedDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.setFeatured(id, dto.featured, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.articlesService.remove(id, user);
  }
}
