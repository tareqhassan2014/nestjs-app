import { SetMetadata } from '@nestjs/common';

import { SubscriptionPlan } from './subscription-plan.enum';

export const SUBSCRIPTION_KEY = 'subscription';
export const RequireSubscription = (...plans: SubscriptionPlan[]) =>
  SetMetadata(SUBSCRIPTION_KEY, plans);
