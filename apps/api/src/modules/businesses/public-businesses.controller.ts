import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TutorContextGuard } from '../auth/guards/tutor-context.guard';
import { CreatePublicAppointmentDto } from './dto/create-public-appointment.dto';

@ApiTags('public-businesses')
@Controller('public/businesses')
export class PublicBusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar negocios publicos' })
  async findAll(@Query('search') search?: string, @Query('businessType') businessType?: string) {
    return this.businessesService.findAllPublic({ search, businessType });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Visualizar perfil publico de um negocio' })
  async findBySlug(@Param('slug') slug: string) {
    return this.businessesService.findPublicBySlug(slug);
  }

  @Post(':slug/appointments')
  @UseGuards(JwtAuthGuard, TutorContextGuard)
  @ApiOperation({ summary: 'Solicitar agendamento como tutor' })
  async createAppointment(
    @Param('slug') slug: string,
    @Body() dto: CreatePublicAppointmentDto,
    @Request() req: any,
  ) {
    return this.businessesService.createPublicAppointment(slug, req.user.sub, dto);
  }
}
