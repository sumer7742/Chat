import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface StoredFile {
  url: string;
  key: string;
  mimeType: string;
  fileName: string;
  size: number;
}

export interface UploadInput {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  size: number;
}

interface StorageDriver {
  put(input: UploadInput): Promise<StoredFile>;
  remove(key: string): Promise<void>;
}

function safeName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^.a-z0-9]/g, '');
  const id = crypto.randomBytes(16).toString('hex');
  return `${id}${ext}`;
}

/** Default driver — writes to a local directory served statically by Express. */
class LocalStorageDriver implements StorageDriver {
  private readonly dir = path.resolve(process.cwd(), env.UPLOAD_DIR);

  async put(input: UploadInput): Promise<StoredFile> {
    await fs.mkdir(this.dir, { recursive: true });
    const key = safeName(input.originalName);
    await fs.writeFile(path.join(this.dir, key), input.buffer);
    return {
      key,
      url: `/${env.UPLOAD_DIR}/${key}`,
      mimeType: input.mimeType,
      fileName: input.originalName,
      size: input.size,
    };
  }

  async remove(key: string): Promise<void> {
    await fs.rm(path.join(this.dir, key), { force: true });
  }
}

/**
 * S3 driver. Uses the AWS SDK lazily so the dependency is only required when the
 * driver is actually selected — keeps the default local setup dependency-free.
 */
class S3StorageDriver implements StorageDriver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  private async getClient() {
    if (this.client) return this.client;
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
    const { S3Client } = require('@aws-sdk/client-s3') as any;
    this.client = new S3Client({ region: env.AWS_REGION });
    return this.client;
  }

  async put(input: UploadInput): Promise<StoredFile> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
    const { PutObjectCommand } = require('@aws-sdk/client-s3') as any;
    const client = await this.getClient();
    const key = `uploads/${safeName(input.originalName)}`;
    await client.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimeType,
      }),
    );
    return {
      key,
      url: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`,
      mimeType: input.mimeType,
      fileName: input.originalName,
      size: input.size,
    };
  }

  async remove(key: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3') as any;
    const client = await this.getClient();
    await client.send(new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }));
  }
}

function buildDriver(): StorageDriver {
  switch (env.STORAGE_DRIVER) {
    case 's3':
      logger.info('Storage driver: S3');
      return new S3StorageDriver();
    case 'cloudinary':
      logger.warn('Cloudinary driver not bundled — falling back to local storage');
      return new LocalStorageDriver();
    default:
      logger.info('Storage driver: local');
      return new LocalStorageDriver();
  }
}

class StorageService {
  private readonly driver = buildDriver();

  upload(input: UploadInput): Promise<StoredFile> {
    return this.driver.put(input);
  }

  remove(key: string): Promise<void> {
    return this.driver.remove(key);
  }
}

export const storageService = new StorageService();
