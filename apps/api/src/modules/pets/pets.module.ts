import { Module } from '@nestjs/common';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { TutorPetsController } from './tutor-pets.controller';

@Module({
  controllers: [PetsController, TutorPetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
