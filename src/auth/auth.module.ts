import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import {
  Enrollment,
  EnrollmentSchema,
} from '@/course/entities/enrollment.entity';
import { RefreshTokenModule } from '@/refresh-token/refresh-token.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    JwtRefreshStrategy,
  ],
  controllers: [AuthController],
  imports: [
    PassportModule,
    RefreshTokenModule,
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
})
export class AuthModule {}
