import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class TutorContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { accountType } = context.switchToHttp().getRequest().user ?? {};
    if (accountType !== 'TUTOR') {
      throw new ForbiddenException('Esta área é exclusiva para contas de tutor.');
    }
    return true;
  }
}
