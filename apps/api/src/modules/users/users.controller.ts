import { Controller, Get, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessContextGuard } from '../auth/guards/business-context.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, BusinessContextGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios do negocio' })
  async findAll(@Request() req: any) {
    return this.usersService.findByBusinessId(req.user.businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuario por ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.usersService.findOneInBusiness(id, req.user.businessId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuario' })
  async update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.usersService.updateInBusiness(id, req.user.businessId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuario' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.usersService.deleteInBusiness(id, req.user.businessId);
  }
}
