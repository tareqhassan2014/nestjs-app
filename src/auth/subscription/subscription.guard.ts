import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

import { SubscriptionStatus, User } from '@/user/entities/user.entity';

import { SubscriptionPlan } from './subscription-plan.enum';
import { SUBSCRIPTION_KEY } from './subscription.decorator';

export interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlans = this.reflector.getAllAndOverride<SubscriptionPlan[]>(
      SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no subscription plans are required, allow access
    if (!requiredPlans || requiredPlans.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    // If no user or user doesn't have a subscription plan, deny access
    if (!user || !user.subscriptions || user.subscriptions.length === 0) {
      throw new ForbiddenException(
        'Subscription required to access this resource',
      );
    }

    // Find the active or trialing subscription
    const activeSubscription = user.subscriptions.find((sub) => {
      return (
        sub.status === SubscriptionStatus.ACTIVE ||
        sub.status === SubscriptionStatus.TRIALING
      );
    });

    if (!activeSubscription) {
      throw new ForbiddenException(
        'Your subscription has expired or is not active.',
      );
    }

    // Check if user's subscription plan is in the list of required plans
    const hasRequiredSubscription = requiredPlans.includes(
      activeSubscription.plan,
    );

    if (!hasRequiredSubscription) {
      throw new ForbiddenException(
        `This resource requires one of the following subscription plans: ${requiredPlans.join(
          ', ',
        )}`,
      );
    }

    return true;
  }
}
