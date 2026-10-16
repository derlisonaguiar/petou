import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterProfessionalDto {
  @ApiProperty({ example: 'Joao Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '(11) 98888-8888' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Cuidador com experiencia em caes e gatos.' })
  @IsOptional()
  @IsString()
  bio?: string;
}
