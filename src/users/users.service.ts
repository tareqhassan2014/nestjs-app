import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from './enums/subscription.enum';
import { UserRole } from './enums/user-role.enum';
import { LastWatchedVideo } from './interfaces/user.interface';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password if provided
      if (createUserDto.password) {
        createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      }

      // Create user with default subscription
      const userData = {
        ...createUserDto,
        subscriptions: [
          {
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.FREE,
            startDate: new Date(),
          },
        ],
      };

      const createdUser = new this.userModel(userData);
      const savedUser = await createdUser.save();

      // Remove password from response
      const userObject = savedUser.toObject();
      delete userObject.password;

      return userObject;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll(includeInactive: boolean = false): Promise<User[]> {
    const filter = includeInactive
      ? {}
      : { isActive: true, deletedAt: { $exists: false } };
    return this.userModel.find(filter).select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by setting deletedAt
    const deletedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        { deletedAt: new Date(), isActive: false },
        { new: true },
      )
      .select('-password')
      .exec();

    return deletedUser;
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async updateLastVisited(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { lastVisited: new Date() }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async addSubscription(
    id: string,
    subscriptionDto: CreateSubscriptionDto,
  ): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add new subscription
    user.subscriptions = user.subscriptions || [];

    // Ensure startDate is set if not provided
    const subscription = {
      ...subscriptionDto,
      startDate: subscriptionDto.startDate || new Date(),
    };

    user.subscriptions.push(subscription);

    const updatedUser = await user.save();
    return updatedUser.toObject();
  }

  async updateSubscription(
    id: string,
    subscriptionIndex: number,
    subscriptionDto: UpdateSubscriptionDto,
  ): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.subscriptions || subscriptionIndex >= user.subscriptions.length) {
      throw new NotFoundException('Subscription not found');
    }

    // Update subscription at index
    Object.assign(user.subscriptions[subscriptionIndex], subscriptionDto);

    const updatedUser = await user.save();
    return updatedUser.toObject();
  }

  async updateLastWatchedVideo(
    id: string,
    lastWatchedVideo: LastWatchedVideo,
  ): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.lastWatchedVideos = user.lastWatchedVideos || [];

    // Remove existing entry for the same module/video
    user.lastWatchedVideos = user.lastWatchedVideos.filter(
      (video) =>
        !(
          video.moduleId === lastWatchedVideo.moduleId &&
          video.videoId === lastWatchedVideo.videoId
        ),
    );

    // Add new entry
    user.lastWatchedVideos.push(lastWatchedVideo);

    // Keep only last 10 watched videos
    if (user.lastWatchedVideos.length > 10) {
      user.lastWatchedVideos = user.lastWatchedVideos.slice(-10);
    }

    const updatedUser = await user.save();
    return updatedUser.toObject();
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.userModel
      .find({ role, isActive: true })
      .select('-password')
      .exec();
  }

  async getUsersBySubscriptionPlan(plan: SubscriptionPlan): Promise<User[]> {
    return this.userModel
      .find({
        'subscriptions.plan': plan,
        'subscriptions.status': {
          $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
        isActive: true,
      })
      .select('-password')
      .exec();
  }

  async getUsersBySubscriptionStatus(
    status: SubscriptionStatus,
  ): Promise<User[]> {
    return this.userModel
      .find({
        'subscriptions.status': status,
        isActive: true,
      })
      .select('-password')
      .exec();
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: true, deletedAt: null }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getActiveUsersCount(): Promise<number> {
    return this.userModel.countDocuments({
      isActive: true,
      deletedAt: { $exists: false },
    });
  }

  async getInactiveUsersCount(): Promise<number> {
    return this.userModel.countDocuments({ isActive: false });
  }

  async getUsersWithTrialAccess(): Promise<User[]> {
    return this.userModel
      .find({
        'subscriptions.isTrial': true,
        'subscriptions.status': SubscriptionStatus.TRIALING,
        isActive: true,
      })
      .select('-password')
      .exec();
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async changePassword(id: string, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await this.userModel
      .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
