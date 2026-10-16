import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PetGender, Species } from '@prisma/client';

export class CreateTutorPetDto {
  @ApiProperty({ example: 'Thor' })
  @IsString()
  name: string;

  @ApiProperty({ enum: Species })
  @IsEnum(Species)
  species: Species;

  @ApiPropertyOptional({ example: 'Golden Retriever' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiProperty({ enum: PetGender })
  @IsEnum(PetGender)
  gender: PetGender;

  @ApiPropertyOptional({ example: '2020-05-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;
}
