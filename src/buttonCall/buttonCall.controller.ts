import { ButtonCallService } from './buttonCall.service';
import { Controller, Body, Post } from '@nestjs/common';

@Controller('button-calls')
export class ButtonCallController {
  constructor(private readonly buttonCallService: ButtonCallService) {}

  @Post()
  createButtonCall(@Body() body: { code: number }) {
    return this.buttonCallService.handleButtonCall(body.code);
  }
}
