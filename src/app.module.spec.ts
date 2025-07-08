import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppModule } from './app.module';
import { AppService } from './app.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AppController', () => {
    const controller = module.get<AppController>(AppController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AppController);
  });

  it('should have AppService', () => {
    const service = module.get<AppService>(AppService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AppService);
  });

  it('should compile without errors', async () => {
    expect(module.get(AppController)).toBeDefined();
    expect(module.get(AppService)).toBeDefined();
  });

  it('should initialize all dependencies', () => {
    const appController = module.get<AppController>(AppController);
    const appService = module.get<AppService>(AppService);

    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });

  it('should have proper module structure', () => {
    expect(module).toBeInstanceOf(TestingModule);
  });
});
