import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsersService } from './users.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/registrations')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminRegistrationsController {
  constructor(private usersService: UsersService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Listar cadastros pendentes de aprovação' })
  async listPending() {
    return this.usersService.listPendingRegistrations();
  }

  @Patch('businesses/:id')
  @ApiOperation({ summary: 'Aprovar ou rejeitar um negócio' })
  async reviewBusiness(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.reviewBusinessRegistration(id, this.usersService.validateRegistrationDecision(status));
  }

  @Patch('professionals/:id')
  @ApiOperation({ summary: 'Aprovar ou rejeitar um profissional' })
  async reviewProfessional(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.reviewProfessionalRegistration(id, this.usersService.validateRegistrationDecision(status));
  }
}
