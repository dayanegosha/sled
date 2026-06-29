import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const bearer = req.headers.authorization?.replace('Bearer ', '');
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = bearer ?? cookies?.access_token;
    if (!token) throw new UnauthorizedException();
    req['user'] = jwt.verify(token, process.env.JWT_SECRET ?? 'dev_secret');
    return true;
  }
}
