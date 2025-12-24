import { StorageDriver } from '../storage.interface';
import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface AliyunOssConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  endpoint?: string;
  secure?: boolean;
}

export class AliyunOssDriver implements StorageDriver {
  private client: OSS;

  constructor(private config: AliyunOssConfig) {
    this.client = new OSS({
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      endpoint: config.endpoint,
      secure: config.secure ?? true,
    });
  }

  async put(file: Express.Multer.File): Promise<{ url: string; path: string }> {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const objectName = `uploads/${filename}`;

    const result = await this.client.put(objectName, file.buffer);
    
    // Normalize URL
    let url = result.url;
    // Sometimes result.url might be http, force https if secure is true
    if (this.config.secure && url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
    }

    return {
      url,
      path: objectName, // In OSS, path is the object name (key)
    };
  }

  async delete(filePath: string): Promise<void> {
    try {
      await this.client.delete(filePath);
    } catch (error) {
      console.warn(`Aliyun OSS delete failed for ${filePath}:`, error);
      // Don't throw error to allow DB cleanup
    }
  }
}
