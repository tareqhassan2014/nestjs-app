import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { EnvironmentKey } from '@/config';
import { TokenPayload } from '@/auth/interface';
import { UserService } from '@/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    configService: ConfigService,
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        EnvironmentKey.JWT_ACCESS_TOKEN_SECRET,
      ),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return (
            request.cookies?.accessToken ||
            ExtractJwt.fromAuthHeaderAsBearerToken()(request)
          );
        },
      ]),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
