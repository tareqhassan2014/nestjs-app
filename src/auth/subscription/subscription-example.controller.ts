import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../guards/auth.guard';
import { SubscriptionPlan } from './subscription-plan.enum';
import { RequireSubscription } from './subscription.decorator';
import { SubscriptionGuard } from './subscription.guard';

@Controller('subscription-example')
@UseGuards(AuthGuard, SubscriptionGuard)
export class SubscriptionExampleController {
  @Get('free')
  @RequireSubscription(
    SubscriptionPlan.FREE,
    SubscriptionPlan.BASIC,
    SubscriptionPlan.PREMIUM,
    SubscriptionPlan.PRO,
  )
  getFreeContent() {
    return { message: 'This content is available to all subscription plans' };
  }

  @Get('basic')
  @RequireSubscription(
    SubscriptionPlan.BASIC,
    SubscriptionPlan.PREMIUM,
    SubscriptionPlan.PRO,
  )
  getBasicContent() {
    return { message: 'This content requires at least a BASIC subscription' };
  }

  @Get('premium')
  @RequireSubscription(SubscriptionPlan.PREMIUM, SubscriptionPlan.PRO)
  getPremiumContent() {
    return { message: 'This content requires at least a PREMIUM subscription' };
  }

  @Get('pro')
  @RequireSubscription(SubscriptionPlan.PRO)
  getProContent() {
    return { message: 'This content requires a PRO subscription' };
  }
}
