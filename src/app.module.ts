import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ButtonCallModule } from './buttonCall/buttonCall.module';

@Module({
  imports: [ButtonCallModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
