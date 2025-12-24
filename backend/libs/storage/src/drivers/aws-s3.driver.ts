import { StorageDriver } from '../storage.interface';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface AwsS3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint?: string; // Optional for S3 compatible services (like MinIO)
}

export class AwsS3Driver implements StorageDriver {
  private client: S3Client;

  constructor(private config: AwsS3Config) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
      forcePathStyle: !!config.endpoint, // Often needed for compatible services
    });
  }

  async put(file: Express.Multer.File): Promise<{ url: string; path: string }> {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const key = `uploads/${filename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read', // Depending on bucket policy
      }),
    );

    // Construct URL
    // Standard S3 URL: https://bucket.s3.region.amazonaws.com/key
    // Compatible service URL might differ
    let url = '';
    if (this.config.endpoint) {
        url = `${this.config.endpoint}/${this.config.bucket}/${key}`;
    } else {
        url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
    }

    return {
      url,
      path: key,
    };
  }

  async delete(filePath: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: filePath,
        }),
      );
    } catch (error) {
       console.warn(`AWS S3 delete failed for ${filePath}:`, error);
    }
  }
}
