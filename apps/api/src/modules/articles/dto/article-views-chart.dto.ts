export class ArticleViewsChartPointDto {
  date!: string;
  views!: number;
}

export class ArticleViewsChartDto {
  days!: number;
  totalInRange!: number;
  points!: ArticleViewsChartPointDto[];
}
