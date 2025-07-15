import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: '+998931781164' })
  @IsNotEmpty()
  phone: string;
  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  password: string;
}
