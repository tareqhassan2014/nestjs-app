import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoCategory } from './enums/video-category.enum';
import { VideoStatus } from './enums/video-status.enum';
import { Video, VideoDocument } from './schemas/video.schema';

@Injectable()
export class YoutubeService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  async create(createVideoDto: CreateVideoDto): Promise<Video> {
    try {
      // Check if video already exists
      const existingVideo = await this.videoModel.findOne({
        youtubeId: createVideoDto.youtubeId,
      });
      if (existingVideo) {
        throw new ConflictException(
          'Video with this YouTube ID already exists',
        );
      }

      // Create video with default analytics and engagement data
      const videoData = {
        ...createVideoDto,
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
      };

      const createdVideo = new this.videoModel(videoData);
      return await createdVideo.save();
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern?.youtubeId) {
          throw new ConflictException(
            'Video with this YouTube ID already exists',
          );
        }
        if (error.keyPattern?.url) {
          throw new ConflictException('Video with this URL already exists');
        }
      }
      throw error;
    }
  }

  async findAll(includeInactive: boolean = false): Promise<Video[]> {
    const filter = includeInactive
      ? {}
      : { isActive: true, deletedAt: { $exists: false } };
    return this.videoModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async findByYoutubeId(youtubeId: string): Promise<Video> {
    const video = await this.videoModel.findOne({ youtubeId }).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Check if YouTube ID is being updated and already exists
    if (
      updateVideoDto.youtubeId &&
      updateVideoDto.youtubeId !== video.youtubeId
    ) {
      const existingVideo = await this.videoModel.findOne({
        youtubeId: updateVideoDto.youtubeId,
      });
      if (existingVideo) {
        throw new ConflictException(
          'Video with this YouTube ID already exists',
        );
      }
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(id, updateVideoDto, { new: true })
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async remove(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Soft delete
    const deletedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        { isActive: false, deletedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!deletedVideo) {
      throw new NotFoundException('Video not found');
    }

    return deletedVideo;
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.videoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Video not found');
    }
  }

  async getActiveVideosCount(): Promise<number> {
    return this.videoModel
      .countDocuments({
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getInactiveVideosCount(): Promise<number> {
    return this.videoModel
      .countDocuments({
        $or: [{ isActive: false }, { deletedAt: { $exists: true } }],
      })
      .exec();
  }

  async getVideosByStatus(status: VideoStatus): Promise<Video[]> {
    return this.videoModel
      .find({
        status,
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getVideosByCategory(category: VideoCategory): Promise<Video[]> {
    return this.videoModel
      .find({
        category,
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getVideosByOwner(ownerId: string): Promise<Video[]> {
    return this.videoModel
      .find({
        ownerId,
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getFeaturedVideos(): Promise<Video[]> {
    return this.videoModel
      .find({
        isFeatured: true,
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getVideosByTags(tags: string[]): Promise<Video[]> {
    return this.videoModel
      .find({
        tags: { $in: tags },
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async updateAnalytics(id: string, analytics: Partial<any>): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            analytics: {
              ...video.analytics,
              ...analytics,
              lastUpdated: new Date(),
            },
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async updateEngagement(id: string, engagement: Partial<any>): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            engagement: { ...video.engagement, ...engagement },
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async publishVideo(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        {
          status: VideoStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async scheduleVideo(id: string, scheduledAt: Date): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        {
          status: VideoStatus.SCHEDULED,
          scheduledAt,
        },
        { new: true },
      )
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async toggleFeatured(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(id, { isFeatured: !video.isFeatured }, { new: true })
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async searchVideos(query: string): Promise<Video[]> {
    return this.videoModel
      .find({
        $and: [
          { isActive: true, deletedAt: { $exists: false } },
          {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { tags: { $regex: query, $options: 'i' } },
              { channelTitle: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      })
      .exec();
  }
}
