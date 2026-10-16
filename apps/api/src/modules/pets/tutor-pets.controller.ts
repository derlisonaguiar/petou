import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TutorContextGuard } from '../auth/guards/tutor-context.guard';
import { CreateTutorPetDto } from './dto/create-tutor-pet.dto';
import { PetsService } from './pets.service';

@ApiTags('tutor-pets')
@Controller('tutor/pets')
@UseGuards(JwtAuthGuard, TutorContextGuard)
@ApiBearerAuth()
export class TutorPetsController {
  constructor(private petsService: PetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pets do tutor autenticado' })
  findAll(@Request() req: any) {
    return this.petsService.findAllForTutor(req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar pet do tutor autenticado' })
  create(@Request() req: any, @Body() dto: CreateTutorPetDto) {
    return this.petsService.createForTutor(req.user.sub, dto);
  }
}
