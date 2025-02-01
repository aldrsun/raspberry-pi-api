import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ButtonCallModule } from './buttonCall/buttonCall.module';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ButtonCallModule],
})
export class AppModule {}
