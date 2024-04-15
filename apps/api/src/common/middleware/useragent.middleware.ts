import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as useragent from 'express-useragent';

@Injectable()
export class UserAgentMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const source = req.headers['user-agent'] || '';
    const ua = useragent.parse(source);
    req.useragent = ua;
    next();
  }
}
