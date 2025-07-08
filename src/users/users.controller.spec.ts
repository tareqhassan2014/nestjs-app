import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: any;

  const mockUser = {
    _id: 'mockUserId',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers = [
    mockUser,
    { ...mockUser, _id: 'mockUserId2', email: 'jane@example.com' },
  ];

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn().mockResolvedValue(mockUser),
      findAll: jest.fn().mockResolvedValue(mockUsers),
      findOne: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
      remove: jest.fn().mockResolvedValue(mockUser),
    };

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should create a user without age', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle create with all fields', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Full User',
        email: 'full@example.com',
        age: 25,
      };

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should create user with minimum required fields', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Min User',
        email: 'min@example.com',
      };

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });

    it('should handle large user lists', async () => {
      const manyUsers = Array(100)
        .fill(mockUser)
        .map((user, index) => ({
          ...user,
          _id: `mockUserId${index}`,
          email: `user${index}@example.com`,
        }));
      mockUsersService.findAll.mockResolvedValue(manyUsers);

      const result = await controller.findAll();

      expect(result).toEqual(manyUsers);
      expect(result.length).toBe(100);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });

    it('should call findAll multiple times', async () => {
      await controller.findAll();
      await controller.findAll();
      await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalledTimes(3);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await controller.findOne('mockUserId');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('mockUserId');
    });

    it('should return null for non-existent user', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('nonExistentId');

      expect(result).toBeNull();
      expect(mockUsersService.findOne).toHaveBeenCalledWith('nonExistentId');
    });

    it('should handle different id formats', async () => {
      const testIds = ['123', 'abc123', '507f1f77bcf86cd799439011'];

      for (const id of testIds) {
        await controller.findOne(id);
        expect(mockUsersService.findOne).toHaveBeenCalledWith(id);
      }
    });

    it('should handle empty id', async () => {
      await controller.findOne('');
      expect(mockUsersService.findOne).toHaveBeenCalledWith('');
    });

    it('should handle special characters in id', async () => {
      const specialIds = ['test-id', 'test_id', 'test.id'];

      for (const id of specialIds) {
        await controller.findOne(id);
        expect(mockUsersService.findOne).toHaveBeenCalledWith(id);
      }
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        age: 35,
      };

      const result = await controller.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
      );
    });

    it('should update user name only', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'New Name',
      };

      const result = await controller.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
      );
    });

    it('should update user email only', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      const result = await controller.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
      );
    });

    it('should update user age only', async () => {
      const updateUserDto: UpdateUserDto = {
        age: 40,
      };

      const result = await controller.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
      );
    });

    it('should update user active status', async () => {
      const updateUserDto: UpdateUserDto = {
        isActive: false,
      };

      const result = await controller.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
      );
    });

    it('should update all fields', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Complete Update',
        email: 'complete@example.com',
        age: 45,
        isActive: false,
      };

      const result = await controller.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
      );
    });

    it('should handle empty update', async () => {
      const updateUserDto: UpdateUserDto = {};

      const result = await controller.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
      );
    });

    it('should handle update with different id formats', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Test' };
      const testIds = ['123', 'abc123', '507f1f77bcf86cd799439011'];

      for (const id of testIds) {
        await controller.update(id, updateUserDto);
        expect(mockUsersService.update).toHaveBeenCalledWith(id, updateUserDto);
      }
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await controller.remove('mockUserId');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith('mockUserId');
    });

    it('should return null when removing non-existent user', async () => {
      mockUsersService.remove.mockResolvedValue(null);

      const result = await controller.remove('nonExistentId');

      expect(result).toBeNull();
      expect(mockUsersService.remove).toHaveBeenCalledWith('nonExistentId');
    });

    it('should handle different id formats for removal', async () => {
      const testIds = ['123', 'abc123', '507f1f77bcf86cd799439011'];

      for (const id of testIds) {
        await controller.remove(id);
        expect(mockUsersService.remove).toHaveBeenCalledWith(id);
      }
    });

    it('should remove active user', async () => {
      const activeUser = { ...mockUser, isActive: true };
      mockUsersService.remove.mockResolvedValue(activeUser);

      const result = await controller.remove('mockUserId');

      expect(result).toEqual(activeUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith('mockUserId');
    });

    it('should remove inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUsersService.remove.mockResolvedValue(inactiveUser);

      const result = await controller.remove('mockUserId');

      expect(result).toEqual(inactiveUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith('mockUserId');
    });

    it('should handle empty id for removal', async () => {
      await controller.remove('');
      expect(mockUsersService.remove).toHaveBeenCalledWith('');
    });

    it('should handle special characters in id for removal', async () => {
      const specialIds = ['test-id', 'test_id', 'test.id'];

      for (const id of specialIds) {
        await controller.remove(id);
        expect(mockUsersService.remove).toHaveBeenCalledWith(id);
      }
    });

    it('should remove multiple users sequentially', async () => {
      const ids = ['id1', 'id2', 'id3'];

      for (const id of ids) {
        await controller.remove(id);
        expect(mockUsersService.remove).toHaveBeenCalledWith(id);
      }

      expect(mockUsersService.remove).toHaveBeenCalledTimes(ids.length);
    });
  });
});
