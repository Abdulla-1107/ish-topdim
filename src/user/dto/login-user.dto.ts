import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: '+998901234567' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  password: string;

}
