import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequestOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CreateUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserQueryDto } from './dto/query-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/decorators/role.decorators';
import { UserRole } from 'src/enums/user-role.enum';
import { AdminGuard } from 'src/auth/role.guard';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "User barcha ma'lumotlarni olish" })
  @Get('/me')
  me(@Req() req: Request) {
    const userId = req['user-id'];

    return this.userService.me(userId);
  }
  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Post('request-otp')
  @ApiOperation({ summary: 'Telefon raqamiga OTP yuborish' })
  @ApiResponse({ status: 200, description: 'OTP yuborildi' })
  @ApiResponse({
    status: 400,
    description:
      'Noto‘g‘ri telefon raqami yoki raqam allaqachon ro‘yxatdan o‘tgan',
  })
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.userService.requestOtp(requestOtpDto.phone);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'OTP-ni tasdiqlash' })
  @ApiResponse({ status: 200, description: 'OTP tasdiqlandi' })
  @ApiResponse({
    status: 400,
    description: 'Noto‘g‘ri OTP kodi yoki muddati tugagan',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.userService.verifyOtp(verifyOtpDto.phone, verifyOtpDto.code);
  }

  @Post('/register')
  async register(@Body() dto: CreateUserDto) {
    return this.userService.register(dto);
  }

  @Post('/login')
  async login(@Body() dto: LoginUserDto) {
    return this.userService.login(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
