import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import crypto from 'crypto';
import { google } from 'googleapis';
import { Model } from 'mongoose';
import { YOUTUBE_API_QUOTA_COSTS } from '../constants/quota-costs.constants';
import { YouTubeApiKey } from '../schemas/youtube-api-key.schema';

@Injectable()
export class ApiKeyManagerService {
  private quotaThreshold: number = 9000;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  // Encryption constants
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 12;
  private readonly SALT_LENGTH = 16;
  private readonly TAG_LENGTH = 16;
  private readonly KEY_LENGTH = 32;
  private readonly ITERATIONS = 100000;

  constructor(
    @InjectModel(YouTubeApiKey.name)
    private youtubeApiKeyModel: Model<YouTubeApiKey>,
  ) {}

  async selectApiKey(): Promise<{ apiKey: string; id: string }> {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const apiKeys = await this.youtubeApiKeyModel
          .find({
            usedQuota: { $lt: this.quotaThreshold },
            isActive: true,
          })
          .sort({ usageCount: 1, usedQuota: 1, lastUsed: 1 })
          .limit(10)
          .exec();

        if (apiKeys.length === 0) {
          throw new Error('No available API keys');
        }

        const randomIndex = crypto.randomInt(0, apiKeys.length);
        const selectedKey = apiKeys[randomIndex];

        await this.youtubeApiKeyModel.findByIdAndUpdate(selectedKey._id, {
          $inc: { usageCount: 1 },
          lastUsed: new Date(),
        });

        return {
          apiKey: this.decrypt(selectedKey.key),
          id: selectedKey._id.toString(),
        };
      } catch (error: any) {
        if (error.code === 'P2034' && retries < this.maxRetries - 1) {
          retries++;
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Failed to select API key after multiple retries');
  }

  async useQuota(apiKeyId: string, resourceMethod: string): Promise<void> {
    const quotaCost = this.getQuotaCost(resourceMethod);

    await this.youtubeApiKeyModel.findByIdAndUpdate(apiKeyId, {
      $inc: { usedQuota: quotaCost },
    });
  }

  async resetDailyQuotas(): Promise<void> {
    await this.youtubeApiKeyModel.updateMany(
      {},
      {
        usedQuota: 0,
        usageCount: 0,
        lastReset: new Date(),
      },
    );
  }

  async rotateApiKeys(): Promise<void> {
    const inactiveKeys = await this.youtubeApiKeyModel
      .find({ isActive: false })
      .sort({ lastUsed: 1 })
      .limit(5)
      .exec();

    const activeKeys = await this.youtubeApiKeyModel
      .find({ isActive: true })
      .sort({ usedQuota: -1 })
      .limit(5)
      .exec();

    // Activate inactive keys
    if (inactiveKeys.length > 0) {
      await this.youtubeApiKeyModel.updateMany(
        { _id: { $in: inactiveKeys.map((key) => key._id) } },
        {
          isActive: true,
          usedQuota: 0,
          usageCount: 0,
        },
      );
    }

    // Deactivate active keys
    if (activeKeys.length > 0) {
      await this.youtubeApiKeyModel.updateMany(
        { _id: { $in: activeKeys.map((key) => key._id) } },
        { isActive: false },
      );
    }
  }

  async addApiKey(userId: string, key: string, name?: string): Promise<void> {
    const encryptedKey = this.encrypt(key);

    await this.youtubeApiKeyModel.create({
      userId,
      key: encryptedKey,
      name: name || 'Unnamed API Key',
      isActive: true,
      usedQuota: 0,
      usageCount: 0,
      lastUsed: new Date(),
      lastReset: new Date(),
    });
  }

  async makeYoutubeApiCall(
    apiCall: (youtube: any) => Promise<any>,
    resourceMethod: string,
    retryCount = 0,
  ): Promise<any> {
    const maxRetries = 3;

    try {
      const apiKeyResult = await this.selectApiKey();
      const youtube = google.youtube({
        version: 'v3',
        auth: apiKeyResult.apiKey,
      });

      const response = await apiCall(youtube);

      await this.useQuota(apiKeyResult.id, resourceMethod);

      return response;
    } catch (error: any) {
      console.error(error);
      if (
        (error.code === 403 && error.errors?.[0]?.reason === 'quotaExceeded') ||
        error.code === 'P2034'
      ) {
        if (retryCount < maxRetries) {
          console.warn(
            `Error occurred. Retrying. Retry count: ${retryCount + 1}`,
          );
          return this.makeYoutubeApiCall(
            apiCall,
            resourceMethod,
            retryCount + 1,
          );
        }
      }
      throw error;
    }
  }

  private getQuotaCost(resourceMethod: string): number {
    return YOUTUBE_API_QUOTA_COSTS[resourceMethod] || 1; // Default to 1 if not found
  }

  // Encryption/Decryption methods
  private encrypt(text: string): string {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

    if (!ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = crypto.pbkdf2Sync(
      ENCRYPTION_KEY,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      'sha256',
    );
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
  }

  private decrypt(encryptedText: string): string {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

    if (!ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    const buffer = Buffer.from(encryptedText, 'hex');

    const salt = buffer.slice(0, this.SALT_LENGTH);
    const iv = buffer.slice(
      this.SALT_LENGTH,
      this.SALT_LENGTH + this.IV_LENGTH,
    );
    const tag = buffer.slice(
      this.SALT_LENGTH + this.IV_LENGTH,
      this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH,
    );
    const encrypted = buffer.slice(
      this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH,
    );

    const key = crypto.pbkdf2Sync(
      ENCRYPTION_KEY,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      'sha256',
    );
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }
}
