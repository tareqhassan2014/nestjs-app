import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { EnvironmentKey } from '@/config';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.body?.refreshToken,
      ]),
      secretOrKey: configService.get<string>(
        EnvironmentKey.JWT_REFRESH_TOKEN_SECRET,
      ),
      passReqToCallback: true,
    });
  }

  async validate(request: Request) {
    return this.refreshTokenService.validateRefreshToken(
      request.body?.refreshToken,
    );
  }
}
