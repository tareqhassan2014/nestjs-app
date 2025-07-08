import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ClientMetadataMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // req.ip =
    //   req.headers['x-forwarded-for']?.toString() ||
    //   req.connection.remoteAddress;
    req.headers['user-agent'] = req.headers['user-agent'] || 'unknown';
    next();
  }
}
