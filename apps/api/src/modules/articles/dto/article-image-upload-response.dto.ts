export class ArticleImageUploadResponseDto {
  /** Public site-relative path, e.g. /uploads/blog/content/file.webp */
  path!: string;
  /** Same as path — editors often expect `url`. */
  url!: string;
}
