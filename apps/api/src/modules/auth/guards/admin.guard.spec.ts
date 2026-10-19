import { ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  const guard = new AdminGuard();
  const contextFor = (role: string, isPlatformAdmin = false) => ({ switchToHttp: () => ({ getRequest: () => ({ user: { role, isPlatformAdmin } }) }) }) as any;

  it('allows only platform administrators', () => {
    expect(guard.canActivate(contextFor('ADMIN', true))).toBe(true);
  });

  it.each(['ADMIN', 'OWNER', 'ATTENDANT'])('denies BUSINESS users with the %s role when they are not platform administrators', (role) => {
    expect(() => guard.canActivate(contextFor(role))).toThrow(ForbiddenException);
  });

  it.each(['TUTOR', 'PROFESSIONAL'])('denies %s accounts', (accountType) => {
    expect(() => guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { accountType, isPlatformAdmin: false } }) }) } as any)).toThrow(ForbiddenException);
  });
});
