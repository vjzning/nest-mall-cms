export interface StorageDriver {
  put(file: Express.Multer.File): Promise<{ url: string; path: string }>;
  delete(path: string): Promise<void>;
}
