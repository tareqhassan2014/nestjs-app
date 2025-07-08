import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { VideoCategory } from '../enums/video-category.enum';
import { CreateVideoDto } from './create-video.dto';

describe('CreateVideoDto', () => {
  const validDto = {
    title: 'Test Video',
    description: 'Test Description',
    youtubeId: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: VideoCategory.EDUCATION,
    tags: ['test', 'video'],
    thumbnail: {
      url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      width: 1920,
      height: 1080,
      quality: 'maxres',
    },
    metadata: {
      duration: 300,
      resolution: '1920x1080',
      frameRate: 30,
      bitrate: 8000,
      format: 'mp4',
      size: 104857600,
    },
    channelTitle: 'Test Channel',
    channelId: 'UC123456789',
    ownerId: '507f1f77bcf86cd799439011',
    isMonetized: true,
  };

  it('should validate with all valid properties', async () => {
    const dto = plainToClass(CreateVideoDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('title validation', () => {
    it('should fail validation without title', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        title: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with empty title', async () => {
      const dto = plainToClass(CreateVideoDto, { ...validDto, title: '' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with title longer than 100 characters', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        title: 'a'.repeat(101),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate with title of exactly 100 characters', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        title: 'a'.repeat(100),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('description validation', () => {
    it('should fail validation without description', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        description: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with empty description', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        description: '',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with description longer than 5000 characters', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        description: 'a'.repeat(5001),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate with description of exactly 5000 characters', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        description: 'a'.repeat(5000),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('youtubeId validation', () => {
    it('should fail validation without youtubeId', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        youtubeId: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('youtubeId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with empty youtubeId', async () => {
      const dto = plainToClass(CreateVideoDto, { ...validDto, youtubeId: '' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('youtubeId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with youtubeId longer than 50 characters', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        youtubeId: 'a'.repeat(51),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('youtubeId');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate with youtubeId of exactly 50 characters', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        youtubeId: 'a'.repeat(50),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('url validation', () => {
    it('should fail validation without url', async () => {
      const dto = plainToClass(CreateVideoDto, { ...validDto, url: undefined });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('url');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with empty url', async () => {
      const dto = plainToClass(CreateVideoDto, { ...validDto, url: '' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('url');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with invalid url format', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        url: 'invalid-url',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('url');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should validate with valid url', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        url: 'https://example.com/video',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('category validation', () => {
    it('should fail validation without category', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        category: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('category');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with invalid category', async () => {
      const dto = plainToClass(CreateVideoDto, {
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
        const dto = plainToClass(CreateVideoDto, { ...validDto, category });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('tags validation', () => {
    it('should validate without tags (optional)', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        tags: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with empty tags array', async () => {
      const dto = plainToClass(CreateVideoDto, { ...validDto, tags: [] });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with non-string tags', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        tags: [123, 'valid'],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('tags');
    });

    it('should fail validation with tag longer than 50 characters', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        tags: ['a'.repeat(51)],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('tags');
    });

    it('should validate with valid tags', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        tags: ['tag1', 'tag2', 'tag3'],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('thumbnail validation', () => {
    it('should fail validation without thumbnail', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        thumbnail: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('thumbnail');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with invalid thumbnail url', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        thumbnail: { ...validDto.thumbnail, url: 'invalid-url' },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('thumbnail');
    });

    it('should fail validation with negative width', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        thumbnail: { ...validDto.thumbnail, width: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('thumbnail');
    });

    it('should fail validation with negative height', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        thumbnail: { ...validDto.thumbnail, height: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('thumbnail');
    });

    it('should validate with valid thumbnail', async () => {
      const dto = plainToClass(CreateVideoDto, {
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
  });

  describe('metadata validation', () => {
    it('should fail validation without metadata', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        metadata: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with negative duration', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        metadata: { ...validDto.metadata, duration: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
    });

    it('should fail validation with negative frameRate', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        metadata: { ...validDto.metadata, frameRate: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
    });

    it('should fail validation with negative bitrate', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        metadata: { ...validDto.metadata, bitrate: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
    });

    it('should fail validation with negative size', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        metadata: { ...validDto.metadata, size: -1 },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('metadata');
    });

    it('should validate with valid metadata', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        metadata: {
          duration: 600,
          resolution: '4K',
          frameRate: 60,
          bitrate: 16000,
          format: 'webm',
          size: 209715200,
        },
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('optional fields validation', () => {
    it('should validate without optional fields', async () => {
      const minimalDto = {
        title: 'Test Video',
        description: 'Test Description',
        youtubeId: 'dQw4w9WgXcQ',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: VideoCategory.EDUCATION,
        thumbnail: {
          url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          width: 1920,
          height: 1080,
          quality: 'maxres',
        },
        metadata: {
          duration: 300,
          resolution: '1920x1080',
          frameRate: 30,
          bitrate: 8000,
          format: 'mp4',
          size: 104857600,
        },
      };

      const dto = plainToClass(CreateVideoDto, minimalDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate channelTitle if provided', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        channelTitle: 'a'.repeat(101),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('channelTitle');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate channelId if provided', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        channelId: 'a'.repeat(51),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('channelId');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate ownerId if provided', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        ownerId: 'invalid-object-id',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('ownerId');
      expect(errors[0].constraints).toHaveProperty('isMongoId');
    });

    it('should validate isMonetized if provided', async () => {
      const dto = plainToClass(CreateVideoDto, {
        ...validDto,
        isMonetized: 'invalid-boolean',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isMonetized');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
});
