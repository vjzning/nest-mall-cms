import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfigEntity } from '@app/db/entities/system-config.entity';
import * as crypto from 'crypto';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SystemConfigService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SystemConfigService.name);
  private configCache: Map<string, string> = new Map();
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-cbc';
  
  private pubClient: RedisClientType;
  private subClient: RedisClientType;
  private readonly CHANNEL_NAME = 'system:config:refresh';

  constructor(
    @InjectRepository(SystemConfigEntity)
    private configRepository: Repository<SystemConfigEntity>,
  ) {
    // Derive a 32-byte key from APP_SECRET or fallback
    const secret = process.env.APP_SECRET || 'default-secret-key-must-be-changed';
    this.encryptionKey = crypto.scryptSync(secret, 'salt', 32);
  }

  async onModuleInit() {
    await this.initRedis();
    await this.refreshCache();
  }

  async onModuleDestroy() {
    if (this.pubClient?.isOpen) await this.pubClient.disconnect();
    if (this.subClient?.isOpen) await this.subClient.disconnect();
  }

  private async initRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
      
      this.pubClient = createClient({ url: redisUrl });
      this.subClient = this.pubClient.duplicate();

      this.pubClient.on('error', (err) => this.logger.error('Redis Pub Client Error', err));
      this.subClient.on('error', (err) => this.logger.error('Redis Sub Client Error', err));

      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);

      await this.subClient.subscribe(this.CHANNEL_NAME, (message) => {
        if (message === 'refresh') {
          this.logger.log('Received refresh signal from Redis');
          this.refreshCache(false); // false = don't publish again
        }
      });
      
      this.logger.log('Redis Pub/Sub initialized for config synchronization');
    } catch (error) {
      this.logger.warn('Failed to initialize Redis for config sync. Multi-instance sync will not work.', error);
    }
  }

  private async publishRefresh() {
    if (this.pubClient?.isOpen) {
      await this.pubClient.publish(this.CHANNEL_NAME, 'refresh');
    }
  }

  async refreshCache(publish = true) {
    this.logger.log('Refreshing system config cache...');
    const configs = await this.configRepository.find();
    this.configCache.clear();
    
    for (const config of configs) {
      let value = config.value;
      if (config.isEncrypted) {
        try {
          value = this.decrypt(value);
        } catch (e) {
          this.logger.error(`Failed to decrypt config key: ${config.key}`, e);
          continue; // Skip invalid values
        }
      }
      this.configCache.set(config.key, value);
    }
    this.logger.log(`Loaded ${this.configCache.size} configs.`);
    
    if (publish) {
      await this.publishRefresh();
    }
  }

  get(key: string): string | undefined {
    return this.configCache.get(key);
  }

  // Encryption helper
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  // Decryption helper
  private decrypt(text: string): string {
    const textParts = text.split(':');
    if (textParts.length !== 2) throw new Error('Invalid encrypted text format');
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  // CRUD Operations
  async findAll() {
    return this.configRepository.find({ order: { group: 'ASC', key: 'ASC' } });
  }

  async create(data: Partial<SystemConfigEntity>) {
    if (data.isEncrypted && data.value) {
      data.value = this.encrypt(data.value);
    }
    const config = this.configRepository.create(data);
    const saved = await this.configRepository.save(config);
    await this.refreshCache();
    return saved;
  }

  async update(id: number, data: Partial<SystemConfigEntity>) {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) throw new Error('Config not found');

    // If value is masked, ignore it (user didn't change it)
    if (data.value === '******') {
      delete data.value;
    } else if (data.isEncrypted && data.value) {
      // If user provided a new value and it should be encrypted
      data.value = this.encrypt(data.value);
    } else if (data.isEncrypted === false && config.isEncrypted === true && data.value) {
      // If switching from encrypted to plain text, use provided value
      // No action needed, data.value is plain text
    }

    Object.assign(config, data);
    const saved = await this.configRepository.save(config);
    await this.refreshCache();
    return saved;
  }

  async remove(id: number) {
    await this.configRepository.delete(id);
    await this.refreshCache();
  }
}
