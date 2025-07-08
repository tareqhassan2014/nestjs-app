import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';
import { UsersModule } from '../src/users/users.module';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(mongoUri),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }

    // Force cleanup any remaining connections
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 100);
    });
  }, 60000);

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.firstName).toBe(createUserDto.firstName);
          expect(res.body.lastName).toBe(createUserDto.lastName);
          expect(res.body.email).toBe(createUserDto.email);
          expect(res.body.isActive).toBe(true);
          expect(res.body._id).toBeDefined();
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
        });
    });

    it('should create a user with optional fields', () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        image: 'https://example.com/jane.jpg',
        hasCourseAccess: true,
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.firstName).toBe(createUserDto.firstName);
          expect(res.body.lastName).toBe(createUserDto.lastName);
          expect(res.body.email).toBe(createUserDto.email);
          expect(res.body.image).toBe(createUserDto.image);
          expect(res.body.hasCourseAccess).toBe(true);
          expect(res.body.isActive).toBe(true);
        });
    });
  });

  describe('/users (GET)', () => {
    it('should get all users', async () => {
      // First create some users
      await request(app.getHttpServer()).post('/users').send({
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
      });

      await request(app.getHttpServer()).post('/users').send({
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
      });

      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get a user by id', async () => {
      // First create a user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
        });

      const userId = createResponse.body._id;

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(userId);
          expect(res.body.firstName).toBe('Test');
          expect(res.body.lastName).toBe('User');
          expect(res.body.email).toBe('test@example.com');
        });
    });

    it('should return 404 for non-existent user', () => {
      const fakeId = '507f1f77bcf86cd799439011';
      return request(app.getHttpServer()).get(`/users/${fakeId}`).expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user', async () => {
      // First create a user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'Original',
          lastName: 'Name',
          email: 'original@example.com',
        });

      const userId = createResponse.body._id;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateUserDto)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(userId);
          expect(res.body.firstName).toBe('Updated');
          expect(res.body.lastName).toBe('Name');
          expect(res.body.email).toBe('original@example.com'); // unchanged
        });
    });

    it('should update user active status', async () => {
      // First create a user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'Active',
          lastName: 'User',
          email: 'active@example.com',
        });

      const userId = createResponse.body._id;

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ isActive: false })
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(userId);
          expect(res.body.isActive).toBe(false);
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete a user', async () => {
      // First create a user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'To',
          lastName: 'Delete',
          email: 'delete@example.com',
        });

      const userId = createResponse.body._id;

      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(userId);
          expect(res.body.firstName).toBe('To');
          expect(res.body.lastName).toBe('Delete');
        });
    });

    it('should return 404 when deleting non-existent user', () => {
      const fakeId = '507f1f77bcf86cd799439011';
      return request(app.getHttpServer())
        .delete(`/users/${fakeId}`)
        .expect(404);
    });
  });
});
