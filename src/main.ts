import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
require('dotenv').config();

import * as express from 'express';
import * as path from 'path';
import * as os from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/logs', express.static(path.join(os.homedir(), 'log')));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
