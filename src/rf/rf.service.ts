import { Chip, Line } from 'node-libgpiod';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as process from 'node:process';

export class RfService implements OnModuleInit, OnModuleDestroy {
  private chip: Chip;
  private rfReceiver: Line;

  constructor() {
    this.chip = new Chip(0); // Use GPIO chip 0
    this.rfReceiver = new Line(this.chip, 27); // GPIO 27
    this.rfReceiver.requestInputMode();
  }

  onModuleInit() {
    console.log('Listening for RF signals...');
    let lastTime = process.hrtime.bigint();
    let lastValue = 0;
    let count = 0;
    while (count < 1000) {
      count++;
      const value = this.rfReceiver.getValue();
      if (lastValue != value) {
        const currentTime = process.hrtime.bigint();
        console.log(
          `RF signal: ${value} (Time diff: ${currentTime - lastTime} µs)`,
        );
        lastValue = value;
        lastTime = currentTime;
      }
    }
    console.log('Listener Stopped');
  }

  onModuleDestroy() {
    this.rfReceiver.release();;
  }
}
