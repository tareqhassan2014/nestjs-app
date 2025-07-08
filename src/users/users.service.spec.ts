import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  const mockUser = {
    _id: 'mockUserId',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue({
      _id: 'mockUserId',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
    }),
  };

  const mockUsers = [
    mockUser,
    { ...mockUser, _id: 'mockUserId2', email: 'jane@example.com' },
  ];

  beforeEach(async () => {
    const mockConstructor = jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: 'mockUserId',
      save: jest.fn().mockResolvedValue({ ...dto, _id: 'mockUserId' }),
    }));

    Object.assign(mockConstructor, {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      }),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
      findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockConstructor,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockUserModel = mockConstructor;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const result = await service.create(createUserDto);

      expect(result).toEqual(expect.objectContaining(createUserDto));
      expect(mockUserModel).toHaveBeenCalledWith(createUserDto);
    });

    it('should create a user without age', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const result = await service.create(createUserDto);

      expect(result).toEqual(expect.objectContaining(createUserDto));
      expect(mockUserModel).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle create with all fields', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Full User',
        email: 'full@example.com',
        age: 25,
      };

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(mockUserModel).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalled();
    });

    it('should return empty array when no users', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockUserModel.find).toHaveBeenCalled();
    });

    it('should handle multiple users', async () => {
      const manyUsers = Array(10)
        .fill(mockUser)
        .map((user, index) => ({
          ...user,
          _id: `mockUserId${index}`,
          email: `user${index}@example.com`,
        }));

      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(manyUsers),
      });

      const result = await service.findAll();

      expect(result).toEqual(manyUsers);
      expect(result.length).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await service.findOne('mockUserId');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('mockUserId');
    });

    it('should return null for non-existent user', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne('nonExistentId');

      expect(result).toBeNull();
      expect(mockUserModel.findById).toHaveBeenCalledWith('nonExistentId');
    });

    it('should handle different id formats', async () => {
      const testIds = ['123', 'abc123', '507f1f77bcf86cd799439011'];

      for (const id of testIds) {
        await service.findOne(id);
        expect(mockUserModel.findById).toHaveBeenCalledWith(id);
      }
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        age: 35,
      };

      const result = await service.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
        { new: true },
      );
    });

    it('should update user name only', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'New Name',
      };

      const result = await service.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
        { new: true },
      );
    });

    it('should update user email only', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      const result = await service.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
        { new: true },
      );
    });

    it('should update user age only', async () => {
      const updateUserDto: UpdateUserDto = {
        age: 40,
      };

      const result = await service.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
        { new: true },
      );
    });

    it('should update user active status', async () => {
      const updateUserDto: UpdateUserDto = {
        isActive: false,
      };

      const result = await service.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
        { new: true },
      );
    });

    it('should update all fields', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Complete Update',
        email: 'complete@example.com',
        age: 45,
        isActive: false,
      };

      const result = await service.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
        { new: true },
      );
    });

    it('should handle empty update', async () => {
      const updateUserDto: UpdateUserDto = {};

      const result = await service.update('mockUserId', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        updateUserDto,
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await service.remove('mockUserId');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        'mockUserId',
      );
    });

    it('should return null when removing non-existent user', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.remove('nonExistentId');

      expect(result).toBeNull();
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        'nonExistentId',
      );
    });

    it('should handle different id formats for removal', async () => {
      const testIds = ['123', 'abc123', '507f1f77bcf86cd799439011'];

      for (const id of testIds) {
        await service.remove(id);
        expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(id);
      }
    });

    it('should remove active user', async () => {
      const activeUser = { ...mockUser, isActive: true };
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(activeUser),
      });

      const result = await service.remove('mockUserId');

      expect(result).toEqual(activeUser);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        'mockUserId',
      );
    });

    it('should remove inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inactiveUser),
      });

      const result = await service.remove('mockUserId');

      expect(result).toEqual(inactiveUser);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        'mockUserId',
      );
    });
  });
});
