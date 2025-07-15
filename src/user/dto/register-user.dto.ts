import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Abdulla Abdusattorov' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'P@ssw0rd123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: '+998901234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'admin', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: 'user.jpg' })
  @IsNotEmpty()
  @IsString()
  image: string;
}
