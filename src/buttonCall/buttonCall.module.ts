import { Module } from '@nestjs/common';
import { ButtonCallController } from './buttonCall.controller';
import { ButtonCallService } from './buttonCall.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ButtonCallService],
  exports: [],
  controllers: [ButtonCallController],
})
export class ButtonCallModule {}
