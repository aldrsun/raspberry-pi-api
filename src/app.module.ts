import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RfService } from './rf/rf.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RfService],
})
export class AppModule {}
