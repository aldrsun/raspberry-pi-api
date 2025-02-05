import { ButtonCallService } from './buttonCall.service';
import { Controller, Body, Post, HttpException, HttpStatus } from '@nestjs/common';

@Controller('button-calls')
export class ButtonCallController {
  constructor(private readonly buttonCallService: ButtonCallService) {}

  @Post()
  createButtonCall(@Body() body: { code: number }) {
    if (!body.code) {
      throw new HttpException('Invalid Code', HttpStatus.BAD_REQUEST);
    }
    return this.buttonCallService.handleButtonCall(body.code);
  }
}
