import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
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
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    isActive: true,
    subscriptions: [
      {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.FREE,
        startDate: new Date(),
      },
    ],
    lastWatchedVideos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.USER,
      isActive: true,
    }),
    save: jest.fn(),
  };

  // Create a properly typed mock for Mongoose model
  const mockUserModel = {
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
  const MockUserConstructor = jest.fn().mockImplementation((data) => {
    const mockUser = {
      ...data,
      _id: '507f1f77bcf86cd799439011',
      toObject: jest.fn().mockReturnValue({
        ...data,
        _id: '507f1f77bcf86cd799439011',
      }),
    };

    mockUser.save = jest.fn().mockResolvedValue(mockUser);

    return mockUser;
  });

  // Combine constructor with static methods
  Object.assign(MockUserConstructor, mockUserModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserConstructor,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));

    // Reset mocks
    jest.clearAllMocks();

    // Reset all mock implementations
    Object.keys(mockUserModel).forEach((key) => {
      if (jest.isMockFunction(mockUserModel[key])) {
        mockUserModel[key].mockReset();
      }
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedUser = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };
      (MockUserConstructor as any).findOne = jest.fn().mockResolvedValue(null);
      (MockUserConstructor as any).constructor = jest
        .fn()
        .mockReturnValue(expectedUser);
      Object.setPrototypeOf(mockUserModel, Model);
      userModel.constructor = jest.fn().mockReturnValue(expectedUser);

      const result = await service.create(createUserDto);

      expect((MockUserConstructor as any).findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(result).toBeDefined();
    });

    it('should hash password if provided', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const expectedUser = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };
      (MockUserConstructor as any).findOne = jest.fn().mockResolvedValue(null);
      (MockUserConstructor as any).constructor = jest
        .fn()
        .mockReturnValue(expectedUser);
      Object.setPrototypeOf(mockUserModel, Model);
      userModel.constructor = jest.fn().mockReturnValue(expectedUser);

      await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      (MockUserConstructor as any).findOne = jest
        .fn()
        .mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle duplicate key error', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const duplicateError = new Error('Duplicate key error');
      (duplicateError as any).code = 11000;

      (MockUserConstructor as any).findOne = jest.fn().mockResolvedValue(null);

      // Mock the constructor to return an object that fails on save
      MockUserConstructor.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(duplicateError),
        toObject: jest.fn(),
      }));

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active users by default', async () => {
      const users = [mockUser];
      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(users),
        }),
      });

      const result = await service.findAll();

      expect((MockUserConstructor as any).find).toHaveBeenCalledWith({
        isActive: true,
        deletedAt: { $exists: false },
      });
      expect(result).toEqual(users);
    });

    it('should return all users when includeInactive is true', async () => {
      const users = [mockUser];
      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(users),
        }),
      });

      const result = await service.findAll(true);

      expect((MockUserConstructor as any).find).toHaveBeenCalledWith({});
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';
      (MockUserConstructor as any).findById = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.findOne(userId);

      expect((MockUserConstructor as any).findById).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      (MockUserConstructor as any).findById = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      (MockUserConstructor as any).findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail(email);

      expect((MockUserConstructor as any).findOne).toHaveBeenCalledWith({
        email: email.toLowerCase(),
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const email = 'test@example.com';
      (MockUserConstructor as any).findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findByGoogleId', () => {
    it('should return a user by google id', async () => {
      const googleId = 'google123';
      (MockUserConstructor as any).findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByGoogleId(googleId);

      expect((MockUserConstructor as any).findOne).toHaveBeenCalledWith({
        googleId,
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const googleId = 'google123';
      (MockUserConstructor as any).findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByGoogleId(googleId);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      (MockUserConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockUser);
      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest
              .fn()
              .mockResolvedValue({ ...mockUser, ...updateUserDto }),
          }),
        });

      const result = await service.update(userId, updateUserDto);

      expect((MockUserConstructor as any).findById).toHaveBeenCalledWith(
        userId,
      );
      expect(
        (MockUserConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(userId, updateUserDto, { new: true });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };

      (MockUserConstructor as any).findById = jest.fn().mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      (MockUserConstructor as any).findById = jest.fn().mockResolvedValue({
        ...mockUser,
        email: 'old@example.com',
      });
      (MockUserConstructor as any).findOne = jest.fn().mockResolvedValue({
        _id: 'different-id',
        email: 'existing@example.com',
      });

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update user with same email', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        email: 'test@example.com',
      };

      (MockUserConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockUser);
      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest
              .fn()
              .mockResolvedValue({ ...mockUser, ...updateUserDto }),
          }),
        });

      const result = await service.update(userId, updateUserDto);

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if updated user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };

      (MockUserConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockUser);
      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        });

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockUser);
      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
              ...mockUser,
              isActive: false,
              deletedAt: new Date(),
            }),
          }),
        });

      const result = await service.remove(userId);

      expect((MockUserConstructor as any).findById).toHaveBeenCalledWith(
        userId,
      );
      expect(
        (MockUserConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        userId,
        { deletedAt: expect.any(Date), isActive: false },
        { new: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findById = jest.fn().mockResolvedValue(null);

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete a user', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findByIdAndDelete = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        });

      await service.hardDelete(userId);

      expect(
        (MockUserConstructor as any).findByIdAndDelete,
      ).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findByIdAndDelete = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

      await expect(service.hardDelete(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLastVisited', () => {
    it('should update user last visited time', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
              ...mockUser,
              lastVisited: new Date(),
            }),
          }),
        });

      const result = await service.updateLastVisited(userId);

      expect(
        (MockUserConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        userId,
        { lastVisited: expect.any(Date) },
        { new: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        });

      await expect(service.updateLastVisited(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addSubscription', () => {
    it('should add subscription to user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const subscriptionDto: CreateSubscriptionDto = {
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
      };

      const mockUserWithSubscription = {
        ...mockUser,
        subscriptions: [subscriptionDto],
        save: jest.fn().mockResolvedValue({
          ...mockUser,
          subscriptions: [subscriptionDto],
        }),
      };

      (MockUserConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockUserWithSubscription);

      const result = await service.addSubscription(userId, subscriptionDto);

      expect((MockUserConstructor as any).findById).toHaveBeenCalledWith(
        userId,
      );
      expect(mockUserWithSubscription.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const subscriptionDto: CreateSubscriptionDto = {
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
      };

      (MockUserConstructor as any).findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.addSubscription(userId, subscriptionDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSubscription', () => {
    it('should update user subscription', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const subscriptionIndex = 0;
      const subscriptionDto: UpdateSubscriptionDto = {
        status: SubscriptionStatus.CANCELED,
      };

      const mockUserWithSubscription = {
        ...mockUser,
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
          },
        ],
        save: jest.fn().mockResolvedValue({
          ...mockUser,
          subscriptions: [
            {
              plan: SubscriptionPlan.PRO,
              status: SubscriptionStatus.CANCELED,
              startDate: new Date(),
            },
          ],
        }),
      };

      (MockUserConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockUserWithSubscription);

      const result = await service.updateSubscription(
        userId,
        subscriptionIndex,
        subscriptionDto,
      );

      expect((MockUserConstructor as any).findById).toHaveBeenCalledWith(
        userId,
      );
      expect(mockUserWithSubscription.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const subscriptionIndex = 0;
      const subscriptionDto: UpdateSubscriptionDto = {
        status: SubscriptionStatus.CANCELED,
      };

      (MockUserConstructor as any).findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateSubscription(userId, subscriptionIndex, subscriptionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if subscription not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const subscriptionIndex = 5;
      const subscriptionDto: UpdateSubscriptionDto = {
        status: SubscriptionStatus.CANCELED,
      };

      const mockUserWithSubscription = {
        ...mockUser,
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
          },
        ],
      };

      (MockUserConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockUserWithSubscription);

      await expect(
        service.updateSubscription(userId, subscriptionIndex, subscriptionDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLastWatchedVideo', () => {
    it('should update user last watched video', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const lastWatchedVideo: LastWatchedVideo = {
        moduleId: 'module123',
        videoId: 'video123',
        timestamp: new Date(),
      };

      const mockUserWithVideo = {
        ...mockUser,
        lastWatchedVideos: [lastWatchedVideo],
        save: jest.fn().mockResolvedValue({
          ...mockUser,
          lastWatchedVideos: [lastWatchedVideo],
        }),
      };

      (MockUserConstructor as any).findById = jest
        .fn()
        .mockResolvedValue(mockUserWithVideo);

      const result = await service.updateLastWatchedVideo(
        userId,
        lastWatchedVideo,
      );

      expect((MockUserConstructor as any).findById).toHaveBeenCalledWith(
        userId,
      );
      expect(mockUserWithVideo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const lastWatchedVideo: LastWatchedVideo = {
        moduleId: 'module123',
        videoId: 'video123',
        timestamp: new Date(),
      };

      (MockUserConstructor as any).findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateLastWatchedVideo(userId, lastWatchedVideo),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsersByRole', () => {
    it('should return users by role', async () => {
      const role = UserRole.ADMIN;
      const users = [{ ...mockUser, role }];

      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(users),
        }),
      });

      const result = await service.getUsersByRole(role);

      expect((MockUserConstructor as any).find).toHaveBeenCalledWith({
        role,
        isActive: true,
      });
      expect(result).toEqual(users);
    });

    it('should return empty array if no users found', async () => {
      const role = UserRole.ADMIN;

      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getUsersByRole(role);

      expect(result).toEqual([]);
    });
  });

  describe('getUsersWithTrialAccess', () => {
    it('should return users with trial access', async () => {
      const trialUsers = [{ ...mockUser, hasTrialAccess: true }];

      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(trialUsers),
        }),
      });

      const result = await service.getUsersWithTrialAccess();

      expect((MockUserConstructor as any).find).toHaveBeenCalledWith({
        'subscriptions.isTrial': true,
        'subscriptions.status': SubscriptionStatus.TRIALING,
        isActive: true,
      });
      expect(result).toEqual(trialUsers);
    });

    it('should return empty array if no trial users found', async () => {
      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getUsersWithTrialAccess();

      expect(result).toEqual([]);
    });
  });

  describe('getUsersBySubscriptionPlan', () => {
    it('should return users by subscription plan', async () => {
      const plan = SubscriptionPlan.PRO;
      const users = [mockUser];

      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(users),
        }),
      });

      const result = await service.getUsersBySubscriptionPlan(plan);

      expect((MockUserConstructor as any).find).toHaveBeenCalledWith({
        'subscriptions.plan': plan,
        'subscriptions.status': {
          $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
        isActive: true,
      });
      expect(result).toEqual(users);
    });

    it('should return empty array if no users found', async () => {
      const plan = SubscriptionPlan.PRO;

      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getUsersBySubscriptionPlan(plan);

      expect(result).toEqual([]);
    });
  });

  describe('getUsersBySubscriptionStatus', () => {
    it('should return users by subscription status', async () => {
      const status = SubscriptionStatus.ACTIVE;
      const users = [mockUser];

      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(users),
        }),
      });

      const result = await service.getUsersBySubscriptionStatus(status);

      expect((MockUserConstructor as any).find).toHaveBeenCalledWith({
        'subscriptions.status': status,
        isActive: true,
      });
      expect(result).toEqual(users);
    });

    it('should return empty array if no users found', async () => {
      const status = SubscriptionStatus.ACTIVE;

      (MockUserConstructor as any).find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getUsersBySubscriptionStatus(status);

      expect(result).toEqual([]);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = UserRole.ADMIN;

      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ ...mockUser, role }),
          }),
        });

      const result = await service.updateUserRole(userId, role);

      expect(
        (MockUserConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(userId, { role }, { new: true });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = UserRole.ADMIN;

      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        });

      await expect(service.updateUserRole(userId, role)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ ...mockUser, isActive: false }),
          }),
        });

      const result = await service.deactivateUser(userId);

      expect(
        (MockUserConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(userId, { isActive: false }, { new: true });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        });

      await expect(service.deactivateUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateUser', () => {
    it('should activate user', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ ...mockUser, isActive: true }),
          }),
        });

      const result = await service.activateUser(userId);

      expect(
        (MockUserConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        userId,
        { isActive: true, deletedAt: null },
        { new: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        });

      await expect(service.activateUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getActiveUsersCount', () => {
    it('should return count of active users', async () => {
      const count = 5;
      (MockUserConstructor as any).countDocuments = jest
        .fn()
        .mockResolvedValue(count);

      const result = await service.getActiveUsersCount();

      expect((MockUserConstructor as any).countDocuments).toHaveBeenCalledWith({
        isActive: true,
        deletedAt: { $exists: false },
      });
      expect(result).toBe(count);
    });
  });

  describe('getInactiveUsersCount', () => {
    it('should return count of inactive users', async () => {
      const count = 2;
      (MockUserConstructor as any).countDocuments = jest
        .fn()
        .mockResolvedValue(count);

      const result = await service.getInactiveUsersCount();

      expect((MockUserConstructor as any).countDocuments).toHaveBeenCalledWith({
        isActive: false,
      });
      expect(result).toBe(count);
    });
  });

  describe('validatePassword', () => {
    it('should validate password correctly', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword123';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(
        plainPassword,
        hashedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const plainPassword = 'wrongpassword';
      const hashedPassword = 'hashedPassword123';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(
        plainPassword,
        hashedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const newPassword = 'newpassword123';
      const hashedPassword = 'hashedNewPassword123';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUser),
          }),
        });

      const result = await service.changePassword(userId, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(
        (MockUserConstructor as any).findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        userId,
        { password: hashedPassword },
        { new: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const newPassword = 'newpassword123';

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (MockUserConstructor as any).findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        });

      await expect(service.changePassword(userId, newPassword)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
