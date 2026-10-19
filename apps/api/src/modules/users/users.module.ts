import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminRegistrationsController } from './admin-registrations.controller';
import { AdminGuard } from '../auth/guards/admin.guard';

@Module({
  controllers: [UsersController, AdminRegistrationsController],
  providers: [UsersService, AdminGuard],
  exports: [UsersService],
})
export class UsersModule {}
