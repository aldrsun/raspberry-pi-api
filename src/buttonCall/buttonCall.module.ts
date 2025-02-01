import { Module } from '@nestjs/common';
import { ButtonCallController } from './buttonCall.controller';
import { ButtonCallService } from './buttonCall.service';

@Module({
  providers: [ButtonCallService],
  exports: [ButtonCallService],
  controllers: [ButtonCallController],
})
export class ButtonCallModule {}
