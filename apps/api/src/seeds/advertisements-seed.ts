import { createWriteStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { finished } from 'node:stream/promises';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { AdPlacement } from '../common/enums/ad-placement.enum';
import { ARTICLE_UPLOAD_URL_PREFIX } from '../modules/articles/article-media.constants';
import { Advertisement } from '../modules/advertisements/entities/advertisement.entity';
import {
  AD_BANNER_IMAGE_SIZE,
  AD_SLOT_IMAGE_SIZE,
  DEMO_ADVERTISEMENTS,
  type DemoAdvertisementSeed,
} from './demo/advertisements.data';

export type AdvertisementSeedResult = {
  title: string;
  action: 'created' | 'updated' | 'skipped';
  imageUrl: string;
};

function resolveAdvertisementUploadDirectory(): string {
  const fromEnv = process.env.ARTICLE_UPLOAD_DIR?.trim();
  if (fromEnv) {
    return resolve(fromEnv);
  }
  return resolve(process.cwd(), '..', 'web', 'public', 'uploads', 'news');
}

function ensureAdvertisementUploadDirectory(): string {
  const dir = resolveAdvertisementUploadDirectory();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function imageSizeForPlacement(placement: AdPlacement) {
  return placement === AdPlacement.AdSlot ? AD_SLOT_IMAGE_SIZE : AD_BANNER_IMAGE_SIZE;
}

function placeholderImageUrl(seed: DemoAdvertisementSeed): string {
  const { width, height } = imageSizeForPlacement(seed.placement);
  const text = encodeURIComponent(seed.bannerText);
  return `https://placehold.co/${width}x${height}/${seed.bgColor}/${seed.textColor}/png?text=${text}`;
}

function localImageFilename(seed: DemoAdvertisementSeed): string {
  return `demo-ad-${seed.slug}.png`;
}

function buildSvgFallback(seed: DemoAdvertisementSeed): string {
  const { width, height } = imageSizeForPlacement(seed.placement);
  const bg = `#${seed.bgColor}`;
  const fg = `#${seed.textColor}`;
  const label = seed.bannerText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <text x="50%" y="50%" fill="${fg}" font-family="Tahoma, Arial, sans-serif" font-size="${Math.round(height * 0.22)}" text-anchor="middle" dominant-baseline="middle">${label}</text>
</svg>`;
}

async function downloadToFile(url: string, destination: string): Promise<void> {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }

  mkdirSync(resolve(destination, '..'), { recursive: true });
  const fileStream = createWriteStream(destination);
  const reader = response.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      fileStream.write(Buffer.from(value));
    }
  } finally {
    fileStream.end();
    await finished(fileStream);
  }
}

async function ensureDemoImage(
  uploadDir: string,
  seed: DemoAdvertisementSeed,
): Promise<string> {
  const filename = localImageFilename(seed);
  const absolutePath = resolve(uploadDir, filename);

  if (!existsSync(absolutePath)) {
    try {
      await downloadToFile(placeholderImageUrl(seed), absolutePath);
    } catch {
      const svgPath = absolutePath.replace(/\.png$/i, '.svg');
      writeFileSync(svgPath, buildSvgFallback(seed), 'utf8');
      return `${ARTICLE_UPLOAD_URL_PREFIX}${localImageFilename(seed).replace(/\.png$/i, '.svg')}`;
    }
  }

  return `${ARTICLE_UPLOAD_URL_PREFIX}${filename}`;
}

async function upsertDemoAdvertisement(
  dataSource: DataSource,
  seed: DemoAdvertisementSeed,
  imageUrl: string,
): Promise<AdvertisementSeedResult> {
  const repo = dataSource.getRepository(Advertisement);
  const existing = await repo.findOne({ where: { title: seed.title } });

  const startsAt = new Date();
  startsAt.setUTCDate(startsAt.getUTCDate() - 7);
  const endsAt = new Date();
  endsAt.setUTCFullYear(endsAt.getUTCFullYear() + 1);

  const payload = {
    title: seed.title,
    imageUrl,
    linkUrl: seed.linkUrl,
    placement: seed.placement,
    slotIndex: seed.slotIndex,
    sortOrder: seed.sortOrder,
    isActive: true,
    rotationEnabled: seed.rotationEnabled,
    rotationIntervalSeconds: seed.rotationIntervalSeconds,
    startsAt,
    endsAt,
  };

  if (existing) {
    Object.assign(existing, payload);
    await repo.save(existing);
    return { title: seed.title, action: 'updated', imageUrl };
  }

  await repo.save(repo.create(payload));
  return { title: seed.title, action: 'created', imageUrl };
}

export async function runAdvertisementsSeed(
  dataSource: DataSource,
): Promise<AdvertisementSeedResult[]> {
  const uploadDir = ensureAdvertisementUploadDirectory();
  const results: AdvertisementSeedResult[] = [];

  for (const seed of DEMO_ADVERTISEMENTS) {
    const imageUrl = await ensureDemoImage(uploadDir, seed);
    results.push(await upsertDemoAdvertisement(dataSource, seed, imageUrl));
  }

  return results;
}
