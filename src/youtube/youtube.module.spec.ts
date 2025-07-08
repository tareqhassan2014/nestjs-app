import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Video } from './schemas/video.schema';
import { YoutubeController } from './youtube.controller';
import { YoutubeModule } from './youtube.module';
import { YoutubeService } from './youtube.service';

describe('YoutubeModule', () => {
  let module: TestingModule;

  const mockVideoModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [YoutubeModule],
    })
      .overrideProvider(getModelToken(Video.name))
      .useValue(mockVideoModel)
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have YoutubeController', () => {
    const controller = module.get<YoutubeController>(YoutubeController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(YoutubeController);
  });

  it('should have YoutubeService', () => {
    const service = module.get<YoutubeService>(YoutubeService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(YoutubeService);
  });

  it('should compile without errors', async () => {
    expect(module.get(YoutubeController)).toBeDefined();
    expect(module.get(YoutubeService)).toBeDefined();
  });

  it('should initialize all dependencies', () => {
    const youtubeController = module.get<YoutubeController>(YoutubeController);
    const youtubeService = module.get<YoutubeService>(YoutubeService);

    expect(youtubeController).toBeDefined();
    expect(youtubeService).toBeDefined();
  });

  it('should have proper module structure', () => {
    expect(module).toBeInstanceOf(TestingModule);
  });

  it('should provide Video model token', () => {
    const videoModel = module.get(getModelToken(Video.name));
    expect(videoModel).toBeDefined();
  });

  it('should export YoutubeService', () => {
    const service = module.get<YoutubeService>(YoutubeService);
    expect(service).toBeDefined();
  });

  it('should register YoutubeController', () => {
    const controller = module.get<YoutubeController>(YoutubeController);
    expect(controller).toBeDefined();
  });
});
