import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTutorDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '(11) 98888-8888' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;
}
