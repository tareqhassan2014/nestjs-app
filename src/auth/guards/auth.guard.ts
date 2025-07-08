import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';

import { EnvironmentKey } from '@/config';
import { IS_OPTIONAL_AUTH_KEY } from '@/auth/decorators/optional-auth.decorator';
import { IS_PUBLIC_KEY } from '@/auth/decorators/public.decorator';
import { getOpenAuthClient } from '@/auth/utils/openauth-client';
import { getSubjects } from '@/auth/utils/openauth-subjects';
import { UserService } from '@/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      if (isOptionalAuth) {
        request['user'] = null;
        return true;
      }
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const payload = await this.validateToken(token);

      // Find user in database by email
      const user = await this.userService.findByEmail(payload.email);

      // If user not found, throw unauthorized
      if (!user) {
        if (isOptionalAuth) {
          request['user'] = null;
          return true;
        }
        throw new UnauthorizedException('Invalid authentication credentials');
      }

      // Attach the user record to the request
      request['user'] = user;
    } catch (error) {
      if (isOptionalAuth) {
        request['user'] = null;
        return true;
      }
      this.logger.error(`Error in canActivate: ${error}`);
      throw new UnauthorizedException('Authentication failed');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(
          EnvironmentKey.JWT_ACCESS_TOKEN_SECRET,
        ),
      });

      return payload;
    } catch (_error) {
      try {
        const issuer = this.configService.get<string>(
          EnvironmentKey.OPEN_AUTH_ISSUER,
        );
        const client = await getOpenAuthClient(issuer);

        const subjects = await getSubjects();

        const result = await client.verify(subjects, token);

        if (result.err) {
          this.logger.error(`OpenAuth verification error: ${result.err}`);
          throw new UnauthorizedException('Invalid authentication token');
        }

        // Set the user based on the OpenAuth verification result
        // This bypasses Passport JWT verification
        if (result.subject && result.subject.properties) {
          // Get the email from the token
          const email = result.subject.properties.email;

          return { email };
        }

        // If we get here but no subject was found, throw an error
        throw new UnauthorizedException('Invalid token format');
      } catch (error) {
        this.logger.error(`Token validation error: ${error.message}`);
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }
}
