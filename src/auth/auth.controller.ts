import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Request, Response } from 'express';
import { Model } from 'mongoose';

import { User as UserEntity } from '@/user/entities/user.entity';
import { Enrollment } from '@/course/entities/enrollment.entity';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { SignUpUserDto } from './dto/create-auth.dto';
import { AuthGuard } from './guards/auth.guard';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

// Define an interface for the expected user object

@ApiTags('Auth')
@Controller('auth')
@UseGuards(CustomThrottlerGuard) // Apply ThrottlerGuard to all routes in this controller
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
  ) {}

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 * 60 } })
  googleAuth() {} // This method is intentionally left empty as it only triggers the AuthGuard

  @Get('/google/redirect')
  @UseGuards(GoogleAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 * 60 } })
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req?.user as any;

    if (!user) throw new Error('Authentication failed!');

    const { accessToken, refreshToken } =
      await this.authService.generateNewTokens(user);

    const redirectUrl =
      'https://app.nexlev.io/login?accessToken=' +
      accessToken +
      '&refreshToken=' +
      refreshToken;
    res.redirect(redirectUrl);
  }

  @Post('/register')
  @Throttle({ default: { limit: 5, ttl: 1000 * 60 } })
  async register(
    @Body() signUpUserDto: SignUpUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = await this.authService.registerUser(signUpUserDto);

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 * 60 } })
  async login(@User() user: UserEntity) {
    const removeFields = ['password', 'refreshToken', '__v'];
    removeFields.forEach((field) => (user[field] = undefined));

    // Fetch user's enrollments directly from the enrollments collection
    try {
      const enrollments = await this.enrollmentModel
        .find({
          userId: user._id.toString(),
        })
        .lean();

      // Attach enrollments data to user response
      const userWithEnrollments = {
        ...user.toObject(),
        enrollments: enrollments.map((enrollment) => ({
          courseId: enrollment.courseId,
          enrolledAt: enrollment.enrolledAt,
          active: enrollment.active,
          stripePaymentId: enrollment.stripePaymentId,
          progress: enrollment.progress,
          lastWatchedInfo: enrollment.lastWatchedInfo || null,
          completedAt: enrollment.completedAt,
          completionPercentage: enrollment.completionPercentage,
          lastAccessedAt: enrollment.lastAccessedAt,
        })),
      };

      const { accessToken, refreshToken } =
        await this.authService.generateNewTokens(user);

      return {
        user: userWithEnrollments,
        accessToken,
        refreshToken,
      };
    } catch (_error) {
      // If enrollment fetching fails, continue with login without enrollments
      const { accessToken, refreshToken } =
        await this.authService.generateNewTokens(user);

      return { user, accessToken, refreshToken };
    }
  }

  @Post('/refresh-tokens')
  @UseGuards(JwtRefreshAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 * 60 } })
  async refreshToken(@User() user: UserEntity) {
    return this.authService.generateNewTokens(user);
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 * 60 } })
  async logout(@User('id') userId: string) {
    await this.refreshTokenService.revokeAllTokensForUser(userId);

    return { message: 'Logged out successfully' };
  }
}
