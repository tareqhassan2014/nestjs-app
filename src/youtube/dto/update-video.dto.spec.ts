import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { VideoCategory } from '../enums/video-category.enum';
import { VideoStatus } from '../enums/video-status.enum';
import { UpdateVideoDto } from './update-video.dto';

describe('UpdateVideoDto', () => {
  const validDto = {
    title: 'Updated Video',
    description: 'Updated Description',
    youtubeId: 'newYoutubeId',
    url: 'https://www.youtube.com/watch?v=newYoutubeId',
    status: VideoStatus.PUBLISHED,
    category: VideoCategory.ENTERTAINMENT,
    tags: ['updated', 'video'],
    thumbnail: {
      url: 'https://img.youtube.com/vi/newYoutubeId/maxresdefault.jpg',
      width: 1920,
      height: 1080,
      quality: 'maxres',
    },
    metadata: {
      duration: 600,
      resolution: '4K',
      frameRate: 60,
      bitrate: 16000,
      format: 'webm',
      size: 209715200,
    },
    channelTitle: 'Updated Channel',
    channelId: 'UC987654321',
    ownerId: '507f1f77bcf86cd799439012',
    isMonetized: false,
    isFeatured: true,
  };

  it('should validate with all valid properties', async () => {
    const dto = plainToClass(UpdateVideoDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate with empty object (all properties are optional)', async () => {
    const dto = plainToClass(UpdateVideoDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('title validation', () => {
    it('should fail validation with empty title', async () => {
      const dto = plainToClass(UpdateVideoDto, { ...validDto, title: '' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with title longer than 100 characters', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        title: 'a'.repeat(101),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate with title of exactly 100 characters', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        title: 'a'.repeat(100),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate without title (optional)', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        title: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('description validation', () => {
    it('should fail validation with empty description', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        description: '',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with description longer than 5000 characters', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        description: 'a'.repeat(5001),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate with description of exactly 5000 characters', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        description: 'a'.repeat(5000),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate without description (optional)', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        description: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('youtubeId validation', () => {
    it('should fail validation with empty youtubeId', async () => {
      const dto = plainToClass(UpdateVideoDto, { ...validDto, youtubeId: '' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('youtubeId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with youtubeId longer than 50 characters', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        youtubeId: 'a'.repeat(51),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('youtubeId');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate with youtubeId of exactly 50 characters', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        youtubeId: 'a'.repeat(50),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate without youtubeId (optional)', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        youtubeId: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('url validation', () => {
    it('should fail validation with empty url', async () => {
      const dto = plainToClass(UpdateVideoDto, { ...validDto, url: '' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('url');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with invalid url format', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        url: 'invalid-url',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('url');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should validate with valid url', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        url: 'https://example.com/video',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate without url (optional)', async () => {
      const dto = plainToClass(UpdateVideoDto, { ...validDto, url: undefined });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('status validation', () => {
    it('should fail validation with invalid status', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        status: 'invalid',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should validate with all valid status values', async () => {
      for (const status of Object.values(VideoStatus)) {
        const dto = plainToClass(UpdateVideoDto, { ...validDto, status });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should validate without status (optional)', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        status: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('category validation', () => {
    it('should fail validation with invalid category', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        category: 'invalid',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('category');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should validate with all valid categories', async () => {
      for (const category of Object.values(VideoCategory)) {
        const dto = plainToClass(UpdateVideoDto, { ...validDto, category });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should validate without category (optional)', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        category: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('tags validation', () => {
    it('should validate with empty tags array', async () => {
      const dto = plainToClass(UpdateVideoDto, { ...validDto, tags: [] });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with non-string tags', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        tags: [123, 'valid'],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('tags');
    });

    it('should fail validation with tag longer than 50 characters', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        tags: ['a'.repeat(51)],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('tags');
    });

    it('should validate with valid tags', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        tags: ['tag1', 'tag2', 'tag3'],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate without tags (optional)', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        tags: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('thumbnail validation', () => {
    it('should fail validation with invalid thumbnail url', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        thumbnail: { ...validDto.thumbnail, url: 'invalid-url' },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('thumbnail');
    });

    it('should fail validation with negative width', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        thumbnail: { ...validDto.thumbnail, width: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('thumbnail');
    });

    it('should fail validation with negative height', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        thumbnail: { ...validDto.thumbnail, height: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('thumbnail');
    });

    it('should validate with valid thumbnail', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        thumbnail: {
          url: 'https://example.com/thumbnail.jpg',
          width: 1920,
          height: 1080,
          quality: 'high',
        },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate without thumbnail (optional)', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        thumbnail: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('metadata validation', () => {
    it('should fail validation with negative duration', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        metadata: { ...validDto.metadata, duration: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
    });

    it('should fail validation with negative frameRate', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        metadata: { ...validDto.metadata, frameRate: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
    });

    it('should fail validation with negative bitrate', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        metadata: { ...validDto.metadata, bitrate: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
    });

    it('should fail validation with negative size', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        metadata: { ...validDto.metadata, size: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
    });

    it('should validate with valid metadata', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        metadata: {
          duration: 900,
          resolution: '8K',
          frameRate: 120,
          bitrate: 32000,
          format: 'av1',
          size: 419430400,
        },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate without metadata (optional)', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        metadata: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('optional fields validation', () => {
    it('should validate channelTitle if provided', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        channelTitle: 'a'.repeat(101),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('channelTitle');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate channelId if provided', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        channelId: 'a'.repeat(51),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('channelId');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate ownerId if provided', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        ownerId: 'invalid-object-id',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ownerId');
      expect(errors[0].constraints).toHaveProperty('isMongoId');
    });

    it('should validate isMonetized if provided', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        isMonetized: 'invalid-boolean',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isMonetized');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should validate isFeatured if provided', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        ...validDto,
        isFeatured: 'invalid-boolean',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isFeatured');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should validate with all optional fields as valid values', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        channelTitle: 'Valid Channel',
        channelId: 'UC123456789',
        ownerId: '507f1f77bcf86cd799439011',
        isMonetized: true,
        isFeatured: false,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate without any optional fields', async () => {
      const dto = plainToClass(UpdateVideoDto, {
        title: 'Minimal Update',
        description: 'Minimal description',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
