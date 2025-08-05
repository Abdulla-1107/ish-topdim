import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const role = request['user-role'];

    if (!role || role !== 'ADMIN') {
      throw new ForbiddenException('siz admin emassiz');
    }

    return true;
  }
}
