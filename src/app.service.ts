import { Injectable } from '@nestjs/common';
import { TypedConfigService } from './config/config.service';

@Injectable()
export class AppService {
  constructor(private configService: TypedConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getAppInfo(): any {
    return {
      serviceName: this.configService.app.serviceName,
      environment: this.configService.app.environment,
      port: this.configService.app.port,
      clientUrl: this.configService.app.clientUrl,
      isDevelopment: this.configService.isDevelopment,
      isProduction: this.configService.isProduction,
    };
  }
}
