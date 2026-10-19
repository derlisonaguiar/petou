import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessContextGuard } from '../auth/guards/business-context.guard';

@ApiTags('businesses')
@Controller('businesses')
@UseGuards(JwtAuthGuard, BusinessContextGuard)
@ApiBearerAuth()
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Get('current')
  @ApiOperation({ summary: 'Obter negocio atual' })
  async getCurrent(@Request() req: any) {
    return this.businessesService.findOne(req.user.businessId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter estatisticas do dashboard' })
  async getDashboard(@Request() req: any) {
    return this.businessesService.getDashboardStats(req.user.businessId);
  }

  @Put('current')
  @ApiOperation({ summary: 'Atualizar negocio atual' })
  async updateCurrent(@Request() req: any, @Body() data: any) {
    return this.businessesService.update(req.user.businessId, data);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Atualizar configuracoes' })
  async updateSettings(@Request() req: any, @Body() settings: any) {
    return this.businessesService.updateSettings(req.user.businessId, settings);
  }

  @Post('current/gallery')
  @UseInterceptors(FilesInterceptor('photos', 6, { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Adicionar fotos à galeria do negócio atual' })
  async addGalleryPhotos(@Request() req: any, @UploadedFiles() photos: any[]) {
    if (!photos?.length) throw new BadRequestException('Selecione ao menos uma imagem.');
    return this.businessesService.addGalleryImages(req.user.businessId, photos);
  }

  @Delete('current/gallery/:fileName')
  @ApiOperation({ summary: 'Remover foto da galeria do negócio atual' })
  async removeGalleryPhoto(@Request() req: any, @Param('fileName') fileName: string) {
    return this.businessesService.removeGalleryImage(req.user.businessId, fileName);
  }
}
