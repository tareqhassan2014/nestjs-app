import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

import { EnvironmentKey } from '@/config';
import { SignUpUserDto } from '@/auth/dto/create-auth.dto';
import { TokenPayload } from '@/auth/interface';
import { User, UserRole } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async registerUser(data: SignUpUserDto): Promise<{ user: User }> {
    const existingUser = await this.userService.findByEmail(data.email);

    if (existingUser) throw new ConflictException('User already exists');

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(data.password, salt);

    const user = await this.userService.createUser({
      ...data,
      password: hashedPassword,
    });

    // Remove password from the response
    user.password = undefined;

    return { user };
  }

  async loginUser(input: {
    email: string;
    password: string;
  }): Promise<{ user: User }> {
    const user = await this.userService.findByEmail(input.email);

    if (!user) throw new NotFoundException('User not found');

    if (!user.password && user.googleId) {
      throw new BadRequestException('Try logging in with Google instead');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    user.password = undefined;
    return { user };
  }

  async googleLogin(userProfile: any): Promise<User> {
    if (!userProfile.id) throw new BadRequestException('Invalid user profile');

    const inputData = {
      googleId: userProfile?.id as string,
      role: UserRole.USER,
      image: userProfile?.photos[0]?.value as string,
      email: userProfile?.emails[0]?.value as string,
      firstName: userProfile?.name?.givenName as string,
      lastName: userProfile?.name?.familyName as string,
    };

    let user = await this.userService.findByEmail(inputData.email);

    if (!user) {
      user = await this.userService.createUser(inputData);
    } else {
      const userId = user._id as string;

      return await this.userService.updateUser(userId, {
        ...user,
        ...inputData,
      });
    }

    return user;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) return null;

    return user;
  }

  public generateAccessToken({ email, _id }: User): string {
    const jti = randomBytes(16).toString('hex');
    const iat = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = { email, userId: _id.toString(), jti, iat };

    const accessTokenSecret = this.configService.get<string>(
      EnvironmentKey.JWT_ACCESS_TOKEN_SECRET,
    );

    const accessTokenExpiresIn = this.configService.get<string>(
      EnvironmentKey.JWT_ACCESS_TOKEN_EXPIRATION,
    );

    return this.jwtService.sign(payload, {
      secret: accessTokenSecret,
      expiresIn: accessTokenExpiresIn,
    });
  }

  async generateNewTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(user);

    const { refreshToken } = await this.refreshTokenService.createRefreshToken(
      user.id,
    );

    return { accessToken, refreshToken };
  }
}
