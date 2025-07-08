import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoCategory } from './enums/video-category.enum';
import { VideoStatus } from './enums/video-status.enum';
import { Video } from './schemas/video.schema';
import { YoutubeService } from './youtube.service';

describe('YoutubeService', () => {
  let service: YoutubeService;

  const mockVideo = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Video',
    description: 'Test Description',
    youtubeId: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: VideoStatus.DRAFT,
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
    analytics: {
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: 0,
      shares: 0,
      watchTime: 0,
      clickThroughRate: 0,
      lastUpdated: new Date(),
    },
    engagement: {
      averageViewDuration: 0,
      retentionRate: 0,
      engagementRate: 0,
      topComments: [],
    },
    isActive: true,
    isFeatured: false,
    isMonetized: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  // Create a properly typed mock for Mongoose model
  const mockVideoModel = {
    // Constructor function
    new: jest.fn(),
    // Static methods
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
  } as any;

  // Make it work as a constructor
  const MockVideoConstructor = jest.fn().mockImplementation((data) => {
    const mockVideoInstance = {
      ...data,
      _id: '507f1f77bcf86cd799439011',
      save: jest.fn().mockResolvedValue({
        ...data,
        _id: '507f1f77bcf86cd799439011',
      }),
    };

    return mockVideoInstance;
  });

  // Combine constructor with static methods
  Object.assign(MockVideoConstructor, mockVideoModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YoutubeService,
        {
          provide: getModelToken(Video.name),
          useValue: MockVideoConstructor,
        },
      ],
    }).compile();

    service = module.get<YoutubeService>(YoutubeService);

    // Reset mocks
    jest.clearAllMocks();

    // Reset all mock implementations
    Object.keys(mockVideoModel).forEach((key) => {
      if (jest.isMockFunction(mockVideoModel[key])) {
        mockVideoModel[key].mockReset();
      }
    });
  });

  describe('create', () => {
    it('should create a new video successfully', async () => {
      const createVideoDto: CreateVideoDto = {
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

      (MockVideoConstructor as any).findOne = jest.fn().mockResolvedValue(null);

      const result = await service.create(createVideoDto);

      expect((MockVideoConstructor as any).findOne).toHaveBeenCalledWith({
        youtubeId: createVideoDto.youtubeId,
      });
      expect(result).toBeDefined();
      expect(result.title).toBe(createVideoDto.title);
    });

    it('should throw ConflictException if video already exists', async () => {
      const createVideoDto: CreateVideoDto = {
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

      (MockVideoConstructor as any).findOne = jest
        .fn()
        .mockResolvedValue(mockVideo);

      await expect(service.create(createVideoDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle duplicate key errors for YouTube ID', async () => {
      const createVideoDto: CreateVideoDto = {
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

      (MockVideoConstructor as any).findOne = jest.fn().mockResolvedValue(null);

      const mockVideoInstance = {
        save: jest.fn().mockRejectedValue({
          code: 11000,
          keyPattern: { youtubeId: 1 },
        }),
      };

      MockVideoConstructor.mockReturnValue(mockVideoInstance);

      await expect(service.create(createVideoDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle duplicate key errors for URL', async () => {
      const createVideoDto: CreateVideoDto = {
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

      (MockVideoConstructor as any).findOne = jest.fn().mockResolvedValue(null);

      const mockVideoInstance = {
        save: jest.fn().mockRejectedValue({
          code: 11000,
          keyPattern: { url: 1 },
        }),
      };

      MockVideoConstructor.mockReturnValue(mockVideoInstance);

      await expect(service.create(createVideoDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw other errors as is', async () => {
      const createVideoDto: CreateVideoDto = {
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

      (MockVideoConstructor as any).findOne = jest.fn().mockResolvedValue(null);

      const mockVideoInstance = {
        save: jest
          .fn()
          .mockRejectedValue(new Error('Database connection error')),
      };

      MockVideoConstructor.mockReturnValue(mockVideoInstance);

      await expect(service.create(createVideoDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all active videos by default', async () => {
      const mockVideos = [mockVideo];
      (MockVideoConstructor as any).find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideos),
      });

      const result = await service.findAll();

      expect((MockVideoConstructor as any).find).toHaveBeenCalledWith({
        isActive: true,
        deletedAt: { $exists: false },
      });
      expect(result).toEqual(mockVideos);
    });

    it('should return all videos including inactive when specified', async () => {
      const mockVideos = [mockVideo];
      (MockVideoConstructor as any).find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideos),
      });

      const result = await service.findAll(true);

      expect((MockVideoConstructor as any).find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockVideos);
    });
  });

  describe('findOne', () => {
    it('should return a video by ID', async () => {
      (MockVideoConstructor as any).findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect((MockVideoConstructor as any).findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockVideo);
    });

    it('should throw NotFoundException if video not found', async () => {
      (MockVideoConstructor as any).findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByYoutubeId', () => {
    it('should return a video by YouTube ID', async () => {
      (MockVideoConstructor as any).findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.findByYoutubeId('dQw4w9WgXcQ');

      expect((MockVideoConstructor as any).findOne).toHaveBeenCalledWith({
        youtubeId: 'dQw4w9WgXcQ',
      });
      expect(result).toEqual(mockVideo);
    });

    it('should throw NotFoundException if video not found', async () => {
      (MockVideoConstructor as any).findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByYoutubeId('dQw4w9WgXcQ')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a video successfully', async () => {
      const updateVideoDto: UpdateVideoDto = {
        title: 'Updated Title',
      };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockVideo, ...updateVideoDto }),
        });

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateVideoDto,
      );

      expect(
        (MockVideoConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateVideoDto, {
        new: true,
      });
      expect(result.title).toBe(updateVideoDto.title);
    });

    it('should throw NotFoundException if video not found', async () => {
      const updateVideoDto: UpdateVideoDto = {
        title: 'Updated Title',
      };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        service.update('507f1f77bcf86cd799439011', updateVideoDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if update returns null', async () => {
      const updateVideoDto: UpdateVideoDto = {
        title: 'Updated Title',
      };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

      await expect(
        service.update('507f1f77bcf86cd799439011', updateVideoDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updating YouTube ID to existing one', async () => {
      const updateVideoDto: UpdateVideoDto = {
        youtubeId: 'newYoutubeId',
      };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findOne = jest
        .fn()
        .mockResolvedValue({ youtubeId: 'newYoutubeId' });

      await expect(
        service.update('507f1f77bcf86cd799439011', updateVideoDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating YouTube ID if it does not exist', async () => {
      const updateVideoDto: UpdateVideoDto = {
        youtubeId: 'newYoutubeId',
      };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findOne = jest.fn().mockResolvedValue(null);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockVideo, ...updateVideoDto }),
        });

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateVideoDto,
      );

      expect(result.youtubeId).toBe(updateVideoDto.youtubeId);
    });
  });

  describe('remove', () => {
    it('should soft delete a video', async () => {
      const deletedVideo = {
        ...mockVideo,
        isActive: false,
        deletedAt: new Date(),
      };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedVideo),
        });

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(
        (MockVideoConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { isActive: false, deletedAt: expect.any(Date) },
        { new: true },
      );
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if video not found', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if soft delete fails', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a video', async () => {
      (MockVideoConstructor as any).findByIdAndDelete = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockVideo),
        });

      await service.hardDelete('507f1f77bcf86cd799439011');

      expect(
        (MockVideoConstructor as any).findByIdAndDelete,
      ).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if video not found', async () => {
      (MockVideoConstructor as any).findByIdAndDelete = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

      await expect(
        service.hardDelete('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getActiveVideosCount', () => {
    it('should return active videos count', async () => {
      (MockVideoConstructor as any).countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await service.getActiveVideosCount();

      expect((MockVideoConstructor as any).countDocuments).toHaveBeenCalledWith(
        {
          isActive: true,
          deletedAt: { $exists: false },
        },
      );
      expect(result).toBe(5);
    });
  });

  describe('getInactiveVideosCount', () => {
    it('should return inactive videos count', async () => {
      (MockVideoConstructor as any).countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await service.getInactiveVideosCount();

      expect((MockVideoConstructor as any).countDocuments).toHaveBeenCalledWith(
        {
          $or: [{ isActive: false }, { deletedAt: { $exists: true } }],
        },
      );
      expect(result).toBe(3);
    });
  });

  describe('getVideosByStatus', () => {
    it('should return videos by status', async () => {
      const mockVideos = [mockVideo];
      (MockVideoConstructor as any).find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideos),
      });

      const result = await service.getVideosByStatus(VideoStatus.DRAFT);

      expect((MockVideoConstructor as any).find).toHaveBeenCalledWith({
        status: VideoStatus.DRAFT,
        isActive: true,
        deletedAt: { $exists: false },
      });
      expect(result).toEqual(mockVideos);
    });
  });

  describe('getVideosByCategory', () => {
    it('should return videos by category', async () => {
      const mockVideos = [mockVideo];
      (MockVideoConstructor as any).find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideos),
      });

      const result = await service.getVideosByCategory(VideoCategory.EDUCATION);

      expect((MockVideoConstructor as any).find).toHaveBeenCalledWith({
        category: VideoCategory.EDUCATION,
        isActive: true,
        deletedAt: { $exists: false },
      });
      expect(result).toEqual(mockVideos);
    });
  });

  describe('getVideosByOwner', () => {
    it('should return videos by owner', async () => {
      const mockVideos = [mockVideo];
      (MockVideoConstructor as any).find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideos),
      });

      const result = await service.getVideosByOwner('507f1f77bcf86cd799439011');

      expect((MockVideoConstructor as any).find).toHaveBeenCalledWith({
        ownerId: '507f1f77bcf86cd799439011',
        isActive: true,
        deletedAt: { $exists: false },
      });
      expect(result).toEqual(mockVideos);
    });
  });

  describe('getFeaturedVideos', () => {
    it('should return featured videos', async () => {
      const mockVideos = [mockVideo];
      (MockVideoConstructor as any).find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideos),
      });

      const result = await service.getFeaturedVideos();

      expect((MockVideoConstructor as any).find).toHaveBeenCalledWith({
        isFeatured: true,
        isActive: true,
        deletedAt: { $exists: false },
      });
      expect(result).toEqual(mockVideos);
    });
  });

  describe('getVideosByTags', () => {
    it('should return videos by tags', async () => {
      const mockVideos = [mockVideo];
      (MockVideoConstructor as any).find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideos),
      });

      const result = await service.getVideosByTags(['tag1', 'tag2']);

      expect((MockVideoConstructor as any).find).toHaveBeenCalledWith({
        tags: { $in: ['tag1', 'tag2'] },
        isActive: true,
        deletedAt: { $exists: false },
      });
      expect(result).toEqual(mockVideos);
    });
  });

  describe('updateAnalytics', () => {
    it('should update video analytics', async () => {
      const analyticsData = { views: 100, likes: 10 };
      const updatedVideo = {
        ...mockVideo,
        analytics: { ...mockVideo.analytics, ...analyticsData },
      };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedVideo),
        });

      const result = await service.updateAnalytics(
        '507f1f77bcf86cd799439011',
        analyticsData,
      );

      expect(
        (MockVideoConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          $set: {
            analytics: {
              ...mockVideo.analytics,
              ...analyticsData,
              lastUpdated: expect.any(Date),
            },
          },
        },
        { new: true },
      );
      expect(result).toEqual(updatedVideo);
    });

    it('should throw NotFoundException if video not found', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        service.updateAnalytics('507f1f77bcf86cd799439011', { views: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if update fails', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

      await expect(
        service.updateAnalytics('507f1f77bcf86cd799439011', { views: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEngagement', () => {
    it('should update video engagement', async () => {
      const engagementData = { averageViewDuration: 150, retentionRate: 0.8 };
      const updatedVideo = {
        ...mockVideo,
        engagement: { ...mockVideo.engagement, ...engagementData },
      };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedVideo),
        });

      const result = await service.updateEngagement(
        '507f1f77bcf86cd799439011',
        engagementData,
      );

      expect(
        (MockVideoConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          $set: {
            engagement: {
              ...mockVideo.engagement,
              ...engagementData,
            },
          },
        },
        { new: true },
      );
      expect(result).toEqual(updatedVideo);
    });

    it('should throw NotFoundException if video not found', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        service.updateEngagement('507f1f77bcf86cd799439011', {
          retentionRate: 0.8,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if update fails', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

      await expect(
        service.updateEngagement('507f1f77bcf86cd799439011', {
          retentionRate: 0.8,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('publishVideo', () => {
    it('should publish a video', async () => {
      const publishedVideo = { ...mockVideo, status: VideoStatus.PUBLISHED };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(publishedVideo),
        });

      const result = await service.publishVideo('507f1f77bcf86cd799439011');

      expect(
        (MockVideoConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          status: VideoStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        },
        { new: true },
      );
      expect(result.status).toBe(VideoStatus.PUBLISHED);
    });

    it('should throw NotFoundException if video not found', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        service.publishVideo('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if publish fails', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

      await expect(
        service.publishVideo('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('scheduleVideo', () => {
    it('should schedule a video', async () => {
      const scheduledDate = new Date('2024-12-31');
      const scheduledVideo = {
        ...mockVideo,
        status: VideoStatus.SCHEDULED,
        scheduledAt: scheduledDate,
      };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(scheduledVideo),
        });

      const result = await service.scheduleVideo(
        '507f1f77bcf86cd799439011',
        scheduledDate,
      );

      expect(
        (MockVideoConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          status: VideoStatus.SCHEDULED,
          scheduledAt: scheduledDate,
        },
        { new: true },
      );
      expect(result.status).toBe(VideoStatus.SCHEDULED);
    });

    it('should throw NotFoundException if video not found', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        service.scheduleVideo(
          '507f1f77bcf86cd799439011',
          new Date('2024-12-31'),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if schedule fails', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

      await expect(
        service.scheduleVideo(
          '507f1f77bcf86cd799439011',
          new Date('2024-12-31'),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleFeatured', () => {
    it('should toggle featured status', async () => {
      const toggledVideo = { ...mockVideo, isFeatured: true };

      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(toggledVideo),
        });

      const result = await service.toggleFeatured('507f1f77bcf86cd799439011');

      expect(
        (MockVideoConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { isFeatured: !mockVideo.isFeatured },
        { new: true },
      );
      expect(result.isFeatured).toBe(true);
    });

    it('should throw NotFoundException if video not found', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        service.toggleFeatured('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if toggle fails', async () => {
      (MockVideoConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockVideo);
      (MockVideoConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

      await expect(
        service.toggleFeatured('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchVideos', () => {
    it('should search videos', async () => {
      const mockVideos = [mockVideo];
      (MockVideoConstructor as any).find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideos),
      });

      const result = await service.searchVideos('test');

      expect((MockVideoConstructor as any).find).toHaveBeenCalledWith({
        $and: [
          { isActive: true, deletedAt: { $exists: false } },
          {
            $or: [
              { title: { $regex: 'test', $options: 'i' } },
              { description: { $regex: 'test', $options: 'i' } },
              { tags: { $regex: 'test', $options: 'i' } },
              { channelTitle: { $regex: 'test', $options: 'i' } },
            ],
          },
        ],
      });
      expect(result).toEqual(mockVideos);
    });

    it('should search with case insensitive regex', async () => {
      const mockVideos = [mockVideo];
      (MockVideoConstructor as any).find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideos),
      });

      await service.searchVideos('TEST');

      expect((MockVideoConstructor as any).find).toHaveBeenCalledWith({
        $and: [
          { isActive: true, deletedAt: { $exists: false } },
          {
            $or: [
              { title: { $regex: 'TEST', $options: 'i' } },
              { description: { $regex: 'TEST', $options: 'i' } },
              { tags: { $regex: 'TEST', $options: 'i' } },
              { channelTitle: { $regex: 'TEST', $options: 'i' } },
            ],
          },
        ],
      });
    });
  });
});
