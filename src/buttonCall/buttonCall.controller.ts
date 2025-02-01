import { ButtonCallService } from './buttonCall.service';
import { Controller, Param, Post } from '@nestjs/common';

@Controller('button-calls')
export class ButtonCallController {
  constructor(private readonly buttonCallService: ButtonCallService) {}

  @Post()
  createButtonCall(@Param('code') code: number) {
    return this.buttonCallService.handleButtonCall(code);
  }
}
