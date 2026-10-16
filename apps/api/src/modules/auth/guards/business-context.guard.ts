import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class BusinessContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { accountType, businessId } = request.user ?? {};

    if (
      accountType !== 'BUSINESS' ||
      typeof businessId !== 'string' ||
      businessId.trim().length === 0
    ) {
      throw new ForbiddenException(
        'Esta área é exclusiva para contas empresariais com negócio vinculado.',
      );
    }

    return true;
  }
}
