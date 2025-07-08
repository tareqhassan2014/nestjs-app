import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { isValidObjectId } from 'mongoose';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from './enums/subscription.enum';
import { UserRole } from './enums/user-role.enum';
import { LastWatchedVideo } from './interfaces/user.interface';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query('includeInactive') includeInactive: string) {
    const include = includeInactive === 'true';
    return this.usersService.findAll(include);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  async getUserStats() {
    const [activeCount, inactiveCount] = await Promise.all([
      this.usersService.getActiveUsersCount(),
      this.usersService.getInactiveUsersCount(),
    ]);

    return {
      activeUsers: activeCount,
      inactiveUsers: inactiveCount,
      totalUsers: activeCount + inactiveCount,
    };
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({ name: 'role', enum: UserRole })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersByRole(@Param('role') role: UserRole) {
    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.usersService.getUsersByRole(role);
  }

  @Get('subscription/plan/:plan')
  @ApiOperation({ summary: 'Get users by subscription plan' })
  @ApiParam({ name: 'plan', enum: SubscriptionPlan })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersBySubscriptionPlan(@Param('plan') plan: SubscriptionPlan) {
    if (!Object.values(SubscriptionPlan).includes(plan)) {
      throw new BadRequestException('Invalid subscription plan');
    }
    return this.usersService.getUsersBySubscriptionPlan(plan);
  }

  @Get('subscription/status/:status')
  @ApiOperation({ summary: 'Get users by subscription status' })
  @ApiParam({ name: 'status', enum: SubscriptionStatus })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersBySubscriptionStatus(
    @Param('status') status: SubscriptionStatus,
  ) {
    if (!Object.values(SubscriptionStatus).includes(status)) {
      throw new BadRequestException('Invalid subscription status');
    }
    return this.usersService.getUsersBySubscriptionStatus(status);
  }

  @Get('trial')
  @ApiOperation({ summary: 'Get users with trial access' })
  @ApiResponse({
    status: 200,
    description: 'Trial users retrieved successfully',
  })
  async getUsersWithTrialAccess() {
    return this.usersService.getUsersWithTrialAccess();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.remove(id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Hard delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User permanently deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.hardDelete(id);
  }

  @Patch(':id/visit')
  @ApiOperation({ summary: 'Update user last visited time' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Last visited time updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateLastVisited(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.updateLastVisited(id);
  }

  @Post(':id/subscription')
  @ApiOperation({ summary: 'Add subscription to user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiResponse({ status: 201, description: 'Subscription added successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async addSubscription(
    @Param('id') id: string,
    @Body(ValidationPipe) subscriptionDto: CreateSubscriptionDto,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.addSubscription(id, subscriptionDto);
  }

  @Patch(':id/subscription/:subscriptionIndex')
  @ApiOperation({ summary: 'Update user subscription' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'subscriptionIndex', description: 'Subscription index' })
  @ApiBody({ type: UpdateSubscriptionDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User or subscription not found' })
  async updateSubscription(
    @Param('id') id: string,
    @Param('subscriptionIndex') subscriptionIndex: string,
    @Body(ValidationPipe) subscriptionDto: UpdateSubscriptionDto,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const index = parseInt(subscriptionIndex, 10);
    if (isNaN(index) || index < 0) {
      throw new BadRequestException('Invalid subscription index');
    }

    return this.usersService.updateSubscription(id, index, subscriptionDto);
  }

  @Patch(':id/last-watched-video')
  @ApiOperation({ summary: 'Update user last watched video' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Last watched video updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateLastWatchedVideo(
    @Param('id') id: string,
    @Body() lastWatchedVideo: LastWatchedVideo,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.updateLastWatchedVideo(id, lastWatchedVideo);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    return this.usersService.updateUserRole(id, role);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivateUser(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.deactivateUser(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activateUser(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.activateUser(id);
  }

  @Patch(':id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    return this.usersService.changePassword(id, newPassword);
  }
}
