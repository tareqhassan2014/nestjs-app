import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../enums/subscription.enum';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Subscription plan',
    example: SubscriptionPlan.BASIC,
    enum: SubscriptionPlan,
  })
  @IsEnum(SubscriptionPlan, {
    message: 'Plan must be a valid subscription plan',
  })
  plan: SubscriptionPlan;

  @ApiProperty({
    description: 'Subscription status',
    example: SubscriptionStatus.ACTIVE,
    enum: SubscriptionStatus,
  })
  @IsEnum(SubscriptionStatus, {
    message: 'Status must be a valid subscription status',
  })
  status: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Stripe customer ID',
    example: 'cus_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Stripe customer ID must be a string' })
  stripeCustomerId?: string;

  @ApiPropertyOptional({
    description: 'Stripe subscription ID',
    example: 'sub_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Stripe subscription ID must be a string' })
  stripeSubscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Plan nickname',
    example: 'Basic Monthly',
  })
  @IsOptional()
  @IsString({ message: 'Plan nickname must be a string' })
  planNickname?: string;

  @ApiPropertyOptional({
    description: 'Billing interval',
    example: 'month',
  })
  @IsOptional()
  @IsString({ message: 'Interval must be a string' })
  interval?: string;

  @ApiPropertyOptional({
    description: 'Subscription start date',
    example: '2023-12-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Subscription end date',
    example: '2024-12-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Whether subscription is in trial',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trial status must be a boolean' })
  isTrial?: boolean;

  @ApiPropertyOptional({
    description: 'Trial end date',
    example: '2023-12-08T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Trial end date must be a valid date' })
  trialEndDate?: Date;

  @ApiPropertyOptional({
    description: 'Stripe price ID',
    example: 'price_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Price ID must be a string' })
  priceId?: string;

  @ApiPropertyOptional({
    description: 'Stripe product ID',
    example: 'prod_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Product ID must be a string' })
  productId?: string;

  @ApiPropertyOptional({
    description: 'Stripe invoice ID',
    example: 'in_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Invoice ID must be a string' })
  invoiceId?: string;

  @ApiPropertyOptional({
    description: 'Stripe event creation time',
    example: 1672531200,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stripe event creation time must be a number' })
  stripeEventCreationTime?: number;
}
