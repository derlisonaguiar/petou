import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.switchToHttp().getRequest().user?.isPlatformAdmin !== true) {
      throw new ForbiddenException('Esta área é exclusiva para administradores.');
    }
    return true;
  }
}
