import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    hardDelete: jest.fn(),
    getActiveUsersCount: jest.fn(),
    getInactiveUsersCount: jest.fn(),
    getUsersByRole: jest.fn(),
    getUsersBySubscriptionPlan: jest.fn(),
    getUsersBySubscriptionStatus: jest.fn(),
    getUsersWithTrialAccess: jest.fn(),
    updateLastVisited: jest.fn(),
    addSubscription: jest.fn(),
    updateSubscription: jest.fn(),
    updateLastWatchedVideo: jest.fn(),
    updateUserRole: jest.fn(),
    deactivateUser: jest.fn(),
    activateUser: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockUser = {
    _id: 'mockUserId',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validObjectId = '507f1f77bcf86cd799439011';
  const invalidObjectId = 'invalid-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should create a user with optional fields', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'password123',
        role: UserRole.ADMIN,
      };

      mockUsersService.create.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
      });

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBeDefined();
    });

    it('should create a user with all fields', async () => {
      const createUserDto: CreateUserDto = {
        email: 'full@example.com',
        firstName: 'Full',
        lastName: 'User',
        password: 'password123',
        image: 'https://example.com/avatar.jpg',
        role: UserRole.PRO,
        hasCourseAccess: true,
        isActive: true,
      };

      mockUsersService.create.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
      });

      const result = await controller.create(createUserDto);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should create a minimal user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'min@example.com',
        firstName: 'Min',
        lastName: 'User',
      };

      mockUsersService.create.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
      });

      const result = await controller.create(createUserDto);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all active users by default', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll('false');

      expect(service.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual(users);
    });

    it('should return all users when includeInactive is true', async () => {
      const users = [mockUser, { ...mockUser, isActive: false }];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll('true');

      expect(service.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual(users);
    });

    it('should handle empty result', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll('false');

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('should handle multiple calls', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      await controller.findAll('false');
      await controller.findAll('false');
      await controller.findAll('false');

      expect(service.findAll).toHaveBeenCalledTimes(3);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockUsersService.getActiveUsersCount.mockResolvedValue(10);
      mockUsersService.getInactiveUsersCount.mockResolvedValue(5);

      const result = await controller.getUserStats();

      expect(service.getActiveUsersCount).toHaveBeenCalled();
      expect(service.getInactiveUsersCount).toHaveBeenCalled();
      expect(result).toEqual({
        activeUsers: 10,
        inactiveUsers: 5,
        totalUsers: 15,
      });
    });

    it('should handle zero counts', async () => {
      mockUsersService.getActiveUsersCount.mockResolvedValue(0);
      mockUsersService.getInactiveUsersCount.mockResolvedValue(0);

      const result = await controller.getUserStats();

      expect(result).toEqual({
        activeUsers: 0,
        inactiveUsers: 0,
        totalUsers: 0,
      });
    });
  });

  describe('getUsersByRole', () => {
    it('should return users by role', async () => {
      const users = [mockUser];
      mockUsersService.getUsersByRole.mockResolvedValue(users);

      const result = await controller.getUsersByRole(UserRole.USER);

      expect(service.getUsersByRole).toHaveBeenCalledWith(UserRole.USER);
      expect(result).toEqual(users);
    });

    it('should handle admin role', async () => {
      const adminUsers = [{ ...mockUser, role: UserRole.ADMIN }];
      mockUsersService.getUsersByRole.mockResolvedValue(adminUsers);

      const result = await controller.getUsersByRole(UserRole.ADMIN);

      expect(service.getUsersByRole).toHaveBeenCalledWith(UserRole.ADMIN);
      expect(result).toEqual(adminUsers);
    });

    it('should throw BadRequestException for invalid role', async () => {
      await expect(
        controller.getUsersByRole('INVALID_ROLE' as UserRole),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUsersBySubscriptionPlan', () => {
    it('should return users by subscription plan', async () => {
      const users = [mockUser];
      mockUsersService.getUsersBySubscriptionPlan.mockResolvedValue(users);

      const result = await controller.getUsersBySubscriptionPlan(
        SubscriptionPlan.FREE,
      );

      expect(service.getUsersBySubscriptionPlan).toHaveBeenCalledWith(
        SubscriptionPlan.FREE,
      );
      expect(result).toEqual(users);
    });

    it('should handle pro plan', async () => {
      const proUsers = [
        { ...mockUser, subscriptionPlan: SubscriptionPlan.PRO },
      ];
      mockUsersService.getUsersBySubscriptionPlan.mockResolvedValue(proUsers);

      const result = await controller.getUsersBySubscriptionPlan(
        SubscriptionPlan.PRO,
      );

      expect(service.getUsersBySubscriptionPlan).toHaveBeenCalledWith(
        SubscriptionPlan.PRO,
      );
      expect(result).toEqual(proUsers);
    });

    it('should throw BadRequestException for invalid plan', async () => {
      await expect(
        controller.getUsersBySubscriptionPlan(
          'INVALID_PLAN' as SubscriptionPlan,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUsersBySubscriptionStatus', () => {
    it('should return users by subscription status', async () => {
      const users = [mockUser];
      mockUsersService.getUsersBySubscriptionStatus.mockResolvedValue(users);

      const result = await controller.getUsersBySubscriptionStatus(
        SubscriptionStatus.ACTIVE,
      );

      expect(service.getUsersBySubscriptionStatus).toHaveBeenCalledWith(
        SubscriptionStatus.ACTIVE,
      );
      expect(result).toEqual(users);
    });

    it('should handle canceled status', async () => {
      const canceledUsers = [
        { ...mockUser, subscriptionStatus: SubscriptionStatus.CANCELED },
      ];
      mockUsersService.getUsersBySubscriptionStatus.mockResolvedValue(
        canceledUsers,
      );

      const result = await controller.getUsersBySubscriptionStatus(
        SubscriptionStatus.CANCELED,
      );

      expect(service.getUsersBySubscriptionStatus).toHaveBeenCalledWith(
        SubscriptionStatus.CANCELED,
      );
      expect(result).toEqual(canceledUsers);
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(
        controller.getUsersBySubscriptionStatus(
          'INVALID_STATUS' as SubscriptionStatus,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUsersWithTrialAccess', () => {
    it('should return users with trial access', async () => {
      const trialUsers = [{ ...mockUser, hasTrialAccess: true }];
      mockUsersService.getUsersWithTrialAccess.mockResolvedValue(trialUsers);

      const result = await controller.getUsersWithTrialAccess();

      expect(service.getUsersWithTrialAccess).toHaveBeenCalled();
      expect(result).toEqual(trialUsers);
    });

    it('should handle empty trial users', async () => {
      mockUsersService.getUsersWithTrialAccess.mockResolvedValue([]);

      const result = await controller.getUsersWithTrialAccess();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(validObjectId);

      expect(service.findOne).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(controller.findOne(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(validObjectId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(validObjectId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };

      await expect(
        controller.update(invalidObjectId, updateUserDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update user firstName only', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'New',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(validObjectId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(validObjectId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should update user email only', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(validObjectId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(validObjectId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should update user role only', async () => {
      const updateUserDto: UpdateUserDto = {
        role: UserRole.ADMIN,
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(validObjectId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(validObjectId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should update user active status', async () => {
      const updateUserDto: UpdateUserDto = {
        isActive: false,
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(validObjectId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(validObjectId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should update all fields', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Complete',
        lastName: 'Update',
        email: 'complete@example.com',
        role: UserRole.PRO,
        isActive: false,
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(validObjectId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(validObjectId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should handle empty update', async () => {
      const updateUserDto: UpdateUserDto = {};

      mockUsersService.update.mockResolvedValue(mockUser);

      const result = await controller.update(validObjectId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(validObjectId, updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(validObjectId);

      expect(service.remove).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(controller.remove(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('hardDelete', () => {
    it('should hard delete a user', async () => {
      mockUsersService.hardDelete.mockResolvedValue(undefined);

      const result = await controller.hardDelete(validObjectId);

      expect(service.hardDelete).toHaveBeenCalledWith(validObjectId);
      expect(result).toBeUndefined();
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(controller.hardDelete(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateLastVisited', () => {
    it('should update user last visited time', async () => {
      const updatedUser = { ...mockUser, lastVisited: new Date() };
      mockUsersService.updateLastVisited.mockResolvedValue(updatedUser);

      const result = await controller.updateLastVisited(validObjectId);

      expect(service.updateLastVisited).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(
        controller.updateLastVisited(invalidObjectId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addSubscription', () => {
    it('should add subscription to user', async () => {
      const subscriptionDto: CreateSubscriptionDto = {
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
      };

      const updatedUser = { ...mockUser, subscriptions: [subscriptionDto] };
      mockUsersService.addSubscription.mockResolvedValue(updatedUser);

      const result = await controller.addSubscription(
        validObjectId,
        subscriptionDto,
      );

      expect(service.addSubscription).toHaveBeenCalledWith(
        validObjectId,
        subscriptionDto,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const subscriptionDto: CreateSubscriptionDto = {
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
      };

      await expect(
        controller.addSubscription(invalidObjectId, subscriptionDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSubscription', () => {
    it('should update user subscription', async () => {
      const subscriptionDto: UpdateSubscriptionDto = {
        status: SubscriptionStatus.CANCELED,
      };

      const updatedUser = {
        ...mockUser,
        subscriptions: [{ ...subscriptionDto, plan: SubscriptionPlan.PRO }],
      };
      mockUsersService.updateSubscription.mockResolvedValue(updatedUser);

      const result = await controller.updateSubscription(
        validObjectId,
        '0',
        subscriptionDto,
      );

      expect(service.updateSubscription).toHaveBeenCalledWith(
        validObjectId,
        0,
        subscriptionDto,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const subscriptionDto: UpdateSubscriptionDto = {
        status: SubscriptionStatus.CANCELED,
      };

      await expect(
        controller.updateSubscription(invalidObjectId, '0', subscriptionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid subscription index', async () => {
      const subscriptionDto: UpdateSubscriptionDto = {
        status: SubscriptionStatus.CANCELED,
      };

      await expect(
        controller.updateSubscription(
          validObjectId,
          'invalid',
          subscriptionDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative subscription index', async () => {
      const subscriptionDto: UpdateSubscriptionDto = {
        status: SubscriptionStatus.CANCELED,
      };

      await expect(
        controller.updateSubscription(validObjectId, '-1', subscriptionDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateLastWatchedVideo', () => {
    it('should update user last watched video', async () => {
      const lastWatchedVideo: LastWatchedVideo = {
        moduleId: 'module123',
        videoId: 'video123',
        timestamp: new Date(),
      };

      const updatedUser = {
        ...mockUser,
        lastWatchedVideos: [lastWatchedVideo],
      };
      mockUsersService.updateLastWatchedVideo.mockResolvedValue(updatedUser);

      const result = await controller.updateLastWatchedVideo(
        validObjectId,
        lastWatchedVideo,
      );

      expect(service.updateLastWatchedVideo).toHaveBeenCalledWith(
        validObjectId,
        lastWatchedVideo,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const lastWatchedVideo: LastWatchedVideo = {
        moduleId: 'module123',
        videoId: 'video123',
        timestamp: new Date(),
      };

      await expect(
        controller.updateLastWatchedVideo(invalidObjectId, lastWatchedVideo),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const newRole = UserRole.ADMIN;
      const updatedUser = { ...mockUser, role: newRole };
      mockUsersService.updateUserRole.mockResolvedValue(updatedUser);

      const result = await controller.updateUserRole(validObjectId, newRole);

      expect(service.updateUserRole).toHaveBeenCalledWith(
        validObjectId,
        newRole,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const newRole = UserRole.ADMIN;

      await expect(
        controller.updateUserRole(invalidObjectId, newRole),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid role', async () => {
      await expect(
        controller.updateUserRole(validObjectId, 'INVALID_ROLE' as UserRole),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      mockUsersService.deactivateUser.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivateUser(validObjectId);

      expect(service.deactivateUser).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(deactivatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(controller.deactivateUser(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('activateUser', () => {
    it('should activate user', async () => {
      const activatedUser = { ...mockUser, isActive: true };
      mockUsersService.activateUser.mockResolvedValue(activatedUser);

      const result = await controller.activateUser(validObjectId);

      expect(service.activateUser).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(activatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(controller.activateUser(invalidObjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const newPassword = 'newPassword123';
      const updatedUser = { ...mockUser };
      mockUsersService.changePassword.mockResolvedValue(updatedUser);

      const result = await controller.changePassword(
        validObjectId,
        newPassword,
      );

      expect(service.changePassword).toHaveBeenCalledWith(
        validObjectId,
        newPassword,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const newPassword = 'newPassword123';

      await expect(
        controller.changePassword(invalidObjectId, newPassword),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for password too short', async () => {
      const shortPassword = '123';

      await expect(
        controller.changePassword(validObjectId, shortPassword),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty password', async () => {
      await expect(
        controller.changePassword(validObjectId, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null password', async () => {
      await expect(
        controller.changePassword(validObjectId, null),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
