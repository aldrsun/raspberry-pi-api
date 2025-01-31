import { Chip, Line } from 'node-libgpiod';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';

export class RfService implements OnModuleInit, OnModuleDestroy {
  private chip: Chip;
  private rfReceiver: Line;

  constructor() {
    this.chip = new Chip(0); // Use GPIO chip 0
    this.rfReceiver = this.chip.getLine(27); // GPIO 27
    this.rfReceiver.requestInputMode();
  }

  onModuleInit() {
    console.log('Listening for RF signals...');
    let lastTime = process.hrtime.bigint();

    setInterval(() => {
      const currentTime = process.hrtime.bigint();
      const timeDiff = (currentTime - lastTime) / BigInt(1000); // Convert to microseconds

      const value = this.rfReceiver.getValue();
      console.log(`RF signal: ${value} (Time diff: ${timeDiff} µs)`);

      lastTime = currentTime;  // Update last time for next comparison
    }, 1000); // fix this, its 1 second
  }

  onModuleDestroy() {
    this.rfReceiver.release();
    this.chip.close();
  }
}
