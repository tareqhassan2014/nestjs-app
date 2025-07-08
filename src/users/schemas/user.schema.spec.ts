import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../enums/subscription.enum';
import { UserRole } from '../enums/user-role.enum';
import { UserSchema } from './user.schema';

describe('UserSchema', () => {
  let mongod: MongoMemoryServer;
  let userModel: any;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    userModel = mongoose.model('User', UserSchema);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe('schema validation', () => {
    it('should create a user with required fields', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBe(UserRole.USER); // default value
      expect(user.isActive).toBe(true); // default value
      expect(user.hasCourseAccess).toBe(false); // default value
      expect(user.hasUsedTrial).toBe(false); // default value
      expect(user.hasUsedCancelFlowCoupon).toBe(false); // default value
      expect(user.subscriptions).toHaveLength(0); // default empty array
      expect(user.lastWatchedVideos).toHaveLength(0); // default empty array
      expect((user as any).createdAt).toBeDefined();
      expect((user as any).updatedAt).toBeDefined();
    });

    it('should create a user with all fields', async () => {
      const userData = {
        email: 'complete@example.com',
        firstName: 'Complete',
        lastName: 'User',
        password: 'hashedPassword123',
        googleId: 'google123',
        image: 'https://example.com/avatar.jpg',
        role: UserRole.ADMIN,
        hasCourseAccess: true,
        isActive: false,
        lastVisited: new Date(),
        hasUsedTrial: true,
        hasUsedCancelFlowCoupon: true,
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
            endDate: new Date(),
            isTrial: true,
          },
        ],
        lastWatchedVideos: [
          {
            moduleId: 'module1',
            videoId: 'video1',
            timestamp: new Date(),
          },
        ],
        deletedAt: new Date(),
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.email).toBe('complete@example.com');
      expect(user.firstName).toBe('Complete');
      expect(user.lastName).toBe('User');
      expect(user.password).toBe('hashedPassword123');
      expect(user.googleId).toBe('google123');
      expect(user.image).toBe('https://example.com/avatar.jpg');
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.hasCourseAccess).toBe(true);
      expect(user.isActive).toBe(false);
      expect(user.hasUsedTrial).toBe(true);
      expect(user.hasUsedCancelFlowCoupon).toBe(true);
      expect(user.subscriptions).toHaveLength(1);
      expect(user.lastWatchedVideos).toHaveLength(1);
      expect(user.deletedAt).toBeDefined();
    });

    it('should require email field', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require firstName field', async () => {
      const userData = {
        email: 'test@example.com',
        lastName: 'Doe',
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require lastName field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const userData1 = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const userData2 = {
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const user1 = new userModel(userData1);
      await user1.save();

      const user2 = new userModel(userData2);
      await expect(user2.save()).rejects.toThrow();
    });

    it('should validate role enum values', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'INVALID_ROLE',
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should accept valid role enum values', async () => {
      for (const role of Object.values(UserRole)) {
        const userData = {
          email: `test${role}@example.com`,
          firstName: 'John',
          lastName: 'Doe',
          role,
        };

        const user = new userModel(userData);
        await user.save();

        expect(user.role).toBe(role);
      }
    });

    it('should validate subscription plan enum values', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: 'INVALID_PLAN',
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
          },
        ],
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should validate subscription status enum values', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            status: 'INVALID_STATUS',
            startDate: new Date(),
          },
        ],
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require subscription plan field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
          },
        ],
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require subscription status field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            startDate: new Date(),
          },
        ],
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require subscription startDate field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
          },
        ],
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require lastWatchedVideo moduleId field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        lastWatchedVideos: [
          {
            videoId: 'video1',
            timestamp: new Date(),
          },
        ],
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require lastWatchedVideo videoId field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        lastWatchedVideos: [
          {
            moduleId: 'module1',
            timestamp: new Date(),
          },
        ],
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should require lastWatchedVideo timestamp field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        lastWatchedVideos: [
          {
            moduleId: 'module1',
            videoId: 'video1',
          },
        ],
      };

      const user = new userModel(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should accept valid subscription with all optional fields', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
            endDate: new Date(),
            isTrial: true,
          },
        ],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.subscriptions[0].plan).toBe(SubscriptionPlan.PRO);
      expect(user.subscriptions[0].status).toBe(SubscriptionStatus.ACTIVE);
      expect(user.subscriptions[0].endDate).toBeDefined();
      expect(user.subscriptions[0].isTrial).toBe(true);
    });

    it('should handle multiple subscriptions', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.FREE,
            startDate: new Date(Date.now() - 1000000),
          },
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
          },
        ],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.subscriptions).toHaveLength(2);
      expect(user.subscriptions[0].plan).toBe(SubscriptionPlan.FREE);
      expect(user.subscriptions[1].plan).toBe(SubscriptionPlan.PRO);
    });

    it('should handle multiple lastWatchedVideos', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        lastWatchedVideos: [
          {
            moduleId: 'module1',
            videoId: 'video1',
            timestamp: new Date(Date.now() - 1000000),
          },
          {
            moduleId: 'module2',
            videoId: 'video2',
            timestamp: new Date(),
          },
        ],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.lastWatchedVideos).toHaveLength(2);
      expect(user.lastWatchedVideos[0].moduleId).toBe('module1');
      expect(user.lastWatchedVideos[1].moduleId).toBe('module2');
    });
  });

  describe('schema indexes', () => {
    it('should have email index', async () => {
      const indexes = await userModel.collection.getIndexes();
      expect(indexes).toHaveProperty('email_1');
    });

    it('should have googleId index', async () => {
      const indexes = await userModel.collection.getIndexes();
      expect(indexes).toHaveProperty('googleId_1');
    });
  });

  describe('schema methods and virtuals', () => {
    it('should auto-generate _id', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = new userModel(userData);
      await user.save();

      expect(user._id).toBeDefined();
      expect(user.id).toBeDefined(); // virtual
    });

    it('should auto-generate timestamps', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = new userModel(userData);
      const beforeSave = new Date();
      await user.save();
      const afterSave = new Date();

      expect((user as any).createdAt).toBeDefined();
      expect((user as any).updatedAt).toBeDefined();
      expect((user as any).createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeSave.getTime(),
      );
      expect((user as any).createdAt.getTime()).toBeLessThanOrEqual(
        afterSave.getTime(),
      );
      expect((user as any).updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeSave.getTime(),
      );
      expect((user as any).updatedAt.getTime()).toBeLessThanOrEqual(
        afterSave.getTime(),
      );
    });

    it('should update updatedAt on save', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = new userModel(userData);
      await user.save();

      const originalUpdatedAt = (user as any).updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      user.firstName = 'Jane';
      await user.save();

      expect((user as any).updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it('should convert to object correctly', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'secret',
      };

      const user = new userModel(userData);
      await user.save();

      const userObject = user.toObject();

      expect(userObject).toHaveProperty('_id');
      expect(userObject).toHaveProperty('email');
      expect(userObject).toHaveProperty('firstName');
      expect(userObject).toHaveProperty('lastName');
      expect(userObject).toHaveProperty('password');
      expect(userObject).toHaveProperty('createdAt');
      expect(userObject).toHaveProperty('updatedAt');
    });

    it('should convert to JSON correctly', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = new userModel(userData);
      await user.save();

      const userJSON = user.toJSON();

      expect(userJSON).toHaveProperty('_id');
      expect(userJSON).toHaveProperty('email');
      expect(userJSON).toHaveProperty('firstName');
      expect(userJSON).toHaveProperty('lastName');
      expect(userJSON).toHaveProperty('createdAt');
      expect(userJSON).toHaveProperty('updatedAt');
    });
  });

  describe('schema virtuals', () => {
    it('should get fullName virtual', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.fullName).toBe('John Doe');
    });

    it('should get currentSubscription virtual - active subscription', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.FREE,
            startDate: new Date(Date.now() - 1000000),
          },
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
          },
        ],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.currentSubscription).toBeDefined();
      expect(user.currentSubscription.plan).toBe(SubscriptionPlan.PRO);
      expect(user.currentSubscription.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should get currentSubscription virtual - trialing subscription', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.TRIALING,
            startDate: new Date(),
          },
        ],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.currentSubscription).toBeDefined();
      expect(user.currentSubscription.plan).toBe(SubscriptionPlan.PRO);
      expect(user.currentSubscription.status).toBe(SubscriptionStatus.TRIALING);
    });

    it('should get currentSubscription virtual - undefined when no subscriptions', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.currentSubscription).toBeUndefined();
    });

    it('should get currentSubscription virtual - fallback to last subscription', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.CANCELED,
            startDate: new Date(Date.now() - 2000000),
          },
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.INCOMPLETE_EXPIRED,
            startDate: new Date(Date.now() - 1000000),
          },
        ],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.currentSubscription).toBeDefined();
      expect(user.currentSubscription.plan).toBe(SubscriptionPlan.PRO);
      expect(user.currentSubscription.status).toBe(
        SubscriptionStatus.INCOMPLETE_EXPIRED,
      );
    });

    it('should get subscriptionStatus virtual - active status', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
          },
        ],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.subscriptionStatus).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should get subscriptionStatus virtual - free status when no subscriptions', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.subscriptionStatus).toBe(SubscriptionStatus.FREE);
    });

    it('should get subscriptionPlan virtual - pro plan', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [
          {
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
          },
        ],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.subscriptionPlan).toBe(SubscriptionPlan.PRO);
    });

    it('should get subscriptionPlan virtual - free plan when no subscriptions', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.subscriptionPlan).toBe(SubscriptionPlan.FREE);
    });
  });

  describe('edge cases', () => {
    it('should handle empty subscriptions array', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptions: [],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.subscriptions).toHaveLength(0);
    });

    it('should handle empty lastWatchedVideos array', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        lastWatchedVideos: [],
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.lastWatchedVideos).toHaveLength(0);
    });

    it('should handle null/undefined optional fields', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: null,
        googleId: undefined,
        image: null,
        lastVisited: undefined,
        deletedAt: null,
      };

      const user = new userModel(userData);
      await user.save();

      expect(user.password).toBeNull();
      expect(user.googleId).toBeUndefined();
      expect(user.image).toBeNull();
      expect(user.lastVisited).toBeUndefined();
      expect(user.deletedAt).toBeNull();
    });
  });
});
