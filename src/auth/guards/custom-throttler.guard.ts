import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';

import { RequestWithUser } from '@/auth/subscription/subscription.guard';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    protected readonly options: ThrottlerModuleOptions,

    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(request: RequestWithUser): Promise<string> {
    // Use user ID if available
    if (request.user && request.user._id.toString()) {
      return `user-${request.user._id.toString()}`;
    }

    // Extract the real IP behind the reverse proxy
    const realIp = request.ips.length ? request.ips[0] : request.ip;
    const userAgent = request.headers?.['user-agent'] || 'unknown-user-agent';

    return `${realIp}-${userAgent}`;
  }

  protected generateKey(
    context: ExecutionContext,
    suffix: string,
    // name: string,
  ): string {
    const handler = context.getHandler().name || 'default-handler';
    const key = `${handler}:${suffix}`;
    return key;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const customMessage =
      this.reflector.get<string>(
        'customRateLimitMessage',
        context.getHandler(),
      ) ||
      'You have exceeded the number of requests. Please wait and try again.';

    throw new ThrottlerException(customMessage);
  }
}
