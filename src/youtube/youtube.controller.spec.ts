import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoCategory } from './enums/video-category.enum';
import { VideoStatus } from './enums/video-status.enum';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';

describe('YoutubeController', () => {
  let controller: YoutubeController;
  let service: YoutubeService;

  const mockYoutubeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByYoutubeId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    hardDelete: jest.fn(),
    getActiveVideosCount: jest.fn(),
    getInactiveVideosCount: jest.fn(),
    getVideosByStatus: jest.fn(),
    getVideosByCategory: jest.fn(),
    getVideosByOwner: jest.fn(),
    getFeaturedVideos: jest.fn(),
    getVideosByTags: jest.fn(),
    searchVideos: jest.fn(),
    publishVideo: jest.fn(),
    scheduleVideo: jest.fn(),
    toggleFeatured: jest.fn(),
    updateAnalytics: jest.fn(),
    updateEngagement: jest.fn(),
  };

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
  };

  const validObjectId = '507f1f77bcf86cd799439011';
  const invalidObjectId = 'invalid-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeController],
      providers: [
        {
          provide: YoutubeService,
          useValue: mockYoutubeService,
        },
      ],
    }).compile();

    controller = module.get<YoutubeController>(YoutubeController);
    service = module.get<YoutubeService>(YoutubeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new video', async () => {
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

      mockYoutubeService.create.mockResolvedValue(mockVideo);

      const result = await controller.create(createVideoDto);

      expect(service.create).toHaveBeenCalledWith(createVideoDto);
      expect(result).toEqual(mockVideo);
    });
  });

  describe('findAll', () => {
    it('should return all videos', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.findAll.mockResolvedValue(mockVideos);

      const result = await controller.findAll('false');

      expect(service.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual(mockVideos);
    });

    it('should return all videos including inactive when specified', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.findAll.mockResolvedValue(mockVideos);

      const result = await controller.findAll('true');

      expect(service.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual(mockVideos);
    });

    it('should default to false when includeInactive is undefined', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.findAll.mockResolvedValue(mockVideos);

      const result = await controller.findAll(undefined);

      expect(service.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual(mockVideos);
    });
  });

  describe('search', () => {
    it('should search videos', async () => {
      const query = 'test';
      const mockVideos = [mockVideo];
      mockYoutubeService.searchVideos.mockResolvedValue(mockVideos);

      const result = await controller.search(query);

      expect(service.searchVideos).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockVideos);
    });

    it('should throw error for empty query', async () => {
      await expect(controller.search('')).rejects.toThrow(BadRequestException);
    });

    it('should throw error for whitespace only query', async () => {
      await expect(controller.search('   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for undefined query', async () => {
      await expect(controller.search(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getActiveVideosCount', () => {
    it('should return active videos count', async () => {
      mockYoutubeService.getActiveVideosCount.mockResolvedValue(5);

      const result = await controller.getActiveVideosCount();

      expect(service.getActiveVideosCount).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });

  describe('getInactiveVideosCount', () => {
    it('should return inactive videos count', async () => {
      mockYoutubeService.getInactiveVideosCount.mockResolvedValue(2);

      const result = await controller.getInactiveVideosCount();

      expect(service.getInactiveVideosCount).toHaveBeenCalled();
      expect(result).toBe(2);
    });
  });

  describe('getFeaturedVideos', () => {
    it('should return featured videos', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.getFeaturedVideos.mockResolvedValue(mockVideos);

      const result = await controller.getFeaturedVideos();

      expect(service.getFeaturedVideos).toHaveBeenCalled();
      expect(result).toEqual(mockVideos);
    });
  });

  describe('findOne', () => {
    it('should return a video by ID', async () => {
      mockYoutubeService.findOne.mockResolvedValue(mockVideo);

      const result = await controller.findOne(validObjectId);

      expect(service.findOne).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockVideo);
    });

    it('should throw error for invalid ID', async () => {
      await expect(controller.findOne(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByYoutubeId', () => {
    it('should return a video by YouTube ID', async () => {
      mockYoutubeService.findByYoutubeId.mockResolvedValue(mockVideo);

      const result = await controller.findByYoutubeId('dQw4w9WgXcQ');

      expect(service.findByYoutubeId).toHaveBeenCalledWith('dQw4w9WgXcQ');
      expect(result).toEqual(mockVideo);
    });

    it('should throw error for empty YouTube ID', async () => {
      await expect(controller.findByYoutubeId('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for whitespace only YouTube ID', async () => {
      await expect(controller.findByYoutubeId('   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for undefined YouTube ID', async () => {
      await expect(controller.findByYoutubeId(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should trim YouTube ID before passing to service', async () => {
      mockYoutubeService.findByYoutubeId.mockResolvedValue(mockVideo);

      await controller.findByYoutubeId('  dQw4w9WgXcQ  ');

      expect(service.findByYoutubeId).toHaveBeenCalledWith('dQw4w9WgXcQ');
    });
  });

  describe('update', () => {
    it('should update a video', async () => {
      const updateVideoDto: UpdateVideoDto = {
        title: 'Updated Title',
      };
      const updatedVideo = { ...mockVideo, title: 'Updated Title' };
      mockYoutubeService.update.mockResolvedValue(updatedVideo);

      const result = await controller.update(validObjectId, updateVideoDto);

      expect(service.update).toHaveBeenCalledWith(
        validObjectId,
        updateVideoDto,
      );
      expect(result).toEqual(updatedVideo);
    });

    it('should throw error for invalid ID', async () => {
      const updateVideoDto: UpdateVideoDto = {
        title: 'Updated Title',
      };

      await expect(
        controller.update(invalidObjectId, updateVideoDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getVideosByStatus', () => {
    it('should return videos by status', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.getVideosByStatus.mockResolvedValue(mockVideos);

      const result = await controller.getVideosByStatus(VideoStatus.DRAFT);

      expect(service.getVideosByStatus).toHaveBeenCalledWith(VideoStatus.DRAFT);
      expect(result).toEqual(mockVideos);
    });

    it('should throw error for invalid status', async () => {
      await expect(
        controller.getVideosByStatus('invalid' as VideoStatus),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle all valid status values', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.getVideosByStatus.mockResolvedValue(mockVideos);

      for (const status of Object.values(VideoStatus)) {
        await controller.getVideosByStatus(status);
        expect(service.getVideosByStatus).toHaveBeenCalledWith(status);
      }
    });
  });

  describe('getVideosByCategory', () => {
    it('should return videos by category', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.getVideosByCategory.mockResolvedValue(mockVideos);

      const result = await controller.getVideosByCategory(
        VideoCategory.EDUCATION,
      );

      expect(service.getVideosByCategory).toHaveBeenCalledWith(
        VideoCategory.EDUCATION,
      );
      expect(result).toEqual(mockVideos);
    });

    it('should throw error for invalid category', async () => {
      await expect(
        controller.getVideosByCategory('invalid' as VideoCategory),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle all valid category values', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.getVideosByCategory.mockResolvedValue(mockVideos);

      for (const category of Object.values(VideoCategory)) {
        await controller.getVideosByCategory(category);
        expect(service.getVideosByCategory).toHaveBeenCalledWith(category);
      }
    });
  });

  describe('getVideosByOwner', () => {
    it('should return videos by owner', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.getVideosByOwner.mockResolvedValue(mockVideos);

      const result = await controller.getVideosByOwner(validObjectId);

      expect(service.getVideosByOwner).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockVideos);
    });

    it('should throw error for invalid owner ID', async () => {
      await expect(
        controller.getVideosByOwner(invalidObjectId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getVideosByTags', () => {
    it('should return videos by tags', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.getVideosByTags.mockResolvedValue(mockVideos);

      const result = await controller.getVideosByTags('tag1,tag2');

      expect(service.getVideosByTags).toHaveBeenCalledWith(['tag1', 'tag2']);
      expect(result).toEqual(mockVideos);
    });

    it('should throw error for empty tags', async () => {
      await expect(controller.getVideosByTags('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for whitespace only tags', async () => {
      await expect(controller.getVideosByTags('   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for undefined tags', async () => {
      await expect(controller.getVideosByTags(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle tags with extra whitespace', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.getVideosByTags.mockResolvedValue(mockVideos);

      await controller.getVideosByTags('  tag1  ,  tag2  ,  ');

      expect(service.getVideosByTags).toHaveBeenCalledWith(['tag1', 'tag2']);
    });

    it('should throw error when all tags are empty after trimming', async () => {
      await expect(controller.getVideosByTags('  ,  ,  ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle single tag', async () => {
      const mockVideos = [mockVideo];
      mockYoutubeService.getVideosByTags.mockResolvedValue(mockVideos);

      await controller.getVideosByTags('singletag');

      expect(service.getVideosByTags).toHaveBeenCalledWith(['singletag']);
    });
  });

  describe('publishVideo', () => {
    it('should publish a video', async () => {
      const publishedVideo = { ...mockVideo, status: VideoStatus.PUBLISHED };
      mockYoutubeService.publishVideo.mockResolvedValue(publishedVideo);

      const result = await controller.publishVideo(validObjectId);

      expect(service.publishVideo).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(publishedVideo);
    });

    it('should throw error for invalid ID', async () => {
      await expect(controller.publishVideo(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('scheduleVideo', () => {
    it('should schedule a video', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const scheduledVideo = { ...mockVideo, status: VideoStatus.SCHEDULED };
      mockYoutubeService.scheduleVideo.mockResolvedValue(scheduledVideo);

      const result = await controller.scheduleVideo(
        validObjectId,
        futureDate.toISOString(),
      );

      expect(service.scheduleVideo).toHaveBeenCalledWith(
        validObjectId,
        futureDate,
      );
      expect(result).toEqual(scheduledVideo);
    });

    it('should throw error for invalid ID', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await expect(
        controller.scheduleVideo(invalidObjectId, futureDate.toISOString()),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for missing scheduled date', async () => {
      await expect(
        controller.scheduleVideo(validObjectId, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for empty scheduled date', async () => {
      await expect(controller.scheduleVideo(validObjectId, '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for invalid date format', async () => {
      await expect(
        controller.scheduleVideo(validObjectId, 'invalid-date'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(
        controller.scheduleVideo(validObjectId, pastDate.toISOString()),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for current date/time', async () => {
      const now = new Date();

      await expect(
        controller.scheduleVideo(validObjectId, now.toISOString()),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('toggleFeatured', () => {
    it('should toggle featured status', async () => {
      const toggledVideo = { ...mockVideo, isFeatured: true };
      mockYoutubeService.toggleFeatured.mockResolvedValue(toggledVideo);

      const result = await controller.toggleFeatured(validObjectId);

      expect(service.toggleFeatured).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(toggledVideo);
    });

    it('should throw error for invalid ID', async () => {
      await expect(controller.toggleFeatured(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateAnalytics', () => {
    it('should update video analytics', async () => {
      const analyticsData = { views: 100, likes: 10 };
      const updatedVideo = {
        ...mockVideo,
        analytics: { ...mockVideo.analytics, ...analyticsData },
      };
      mockYoutubeService.updateAnalytics.mockResolvedValue(updatedVideo);

      const result = await controller.updateAnalytics(
        validObjectId,
        analyticsData,
      );

      expect(service.updateAnalytics).toHaveBeenCalledWith(
        validObjectId,
        analyticsData,
      );
      expect(result).toEqual(updatedVideo);
    });

    it('should throw error for invalid ID', async () => {
      await expect(
        controller.updateAnalytics(invalidObjectId, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle empty analytics data', async () => {
      const updatedVideo = { ...mockVideo };
      mockYoutubeService.updateAnalytics.mockResolvedValue(updatedVideo);

      const result = await controller.updateAnalytics(validObjectId, {});

      expect(service.updateAnalytics).toHaveBeenCalledWith(validObjectId, {});
      expect(result).toEqual(updatedVideo);
    });
  });

  describe('updateEngagement', () => {
    it('should update video engagement', async () => {
      const engagementData = { averageViewDuration: 150, retentionRate: 0.8 };
      const updatedVideo = {
        ...mockVideo,
        engagement: { ...mockVideo.engagement, ...engagementData },
      };
      mockYoutubeService.updateEngagement.mockResolvedValue(updatedVideo);

      const result = await controller.updateEngagement(
        validObjectId,
        engagementData,
      );

      expect(service.updateEngagement).toHaveBeenCalledWith(
        validObjectId,
        engagementData,
      );
      expect(result).toEqual(updatedVideo);
    });

    it('should throw error for invalid ID', async () => {
      await expect(
        controller.updateEngagement(invalidObjectId, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle empty engagement data', async () => {
      const updatedVideo = { ...mockVideo };
      mockYoutubeService.updateEngagement.mockResolvedValue(updatedVideo);

      const result = await controller.updateEngagement(validObjectId, {});

      expect(service.updateEngagement).toHaveBeenCalledWith(validObjectId, {});
      expect(result).toEqual(updatedVideo);
    });
  });

  describe('remove', () => {
    it('should soft delete a video', async () => {
      const deletedVideo = { ...mockVideo, isActive: false };
      mockYoutubeService.remove.mockResolvedValue(deletedVideo);

      const result = await controller.remove(validObjectId);

      expect(service.remove).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(deletedVideo);
    });

    it('should throw error for invalid ID', async () => {
      await expect(controller.remove(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('hardDelete', () => {
    it('should hard delete a video', async () => {
      mockYoutubeService.hardDelete.mockResolvedValue(undefined);

      const result = await controller.hardDelete(validObjectId);

      expect(service.hardDelete).toHaveBeenCalledWith(validObjectId);
      expect(result).toBeUndefined();
    });

    it('should throw error for invalid ID', async () => {
      await expect(controller.hardDelete(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
