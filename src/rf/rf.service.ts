import { Chip, Line } from 'node-libgpiod';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, isMainThread, parentPort } from 'worker_threads';

export class RfService implements OnModuleInit, OnModuleDestroy {
  private chip: Chip;
  private rfReceiver: Line;

  constructor() {
    this.chip = new Chip(0); // Use GPIO chip 0
    this.rfReceiver = new Line(this.chip, 27); // GPIO 27
    this.rfReceiver.requestInputMode();
  }

  onModuleInit() {
    console.log('Starting RF signal worker...');

    // Run the worker thread to constantly read RF signals
    if (isMainThread) {
      const worker = new Worker(__filename); // Run this file in a new thread
      worker.on('message', (message) => {
        console.log(`RF signal: ${message.value} (Time diff: ${message.timeDiff} µs)`);
      });
      worker.on('error', (err) => {
        console.error('Worker error:', err);
      });
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
        }
      });
    }
  }

  onModuleDestroy() {
    this.rfReceiver.release();
  }
}

// Worker thread logic (if this is running in a worker thread)
if (!isMainThread) {
  const chip = new Chip(0); // Use GPIO chip 0
  const rfReceiver = new Line(chip, 27); // GPIO 27
  rfReceiver.requestInputMode();

  let lastTime = process.hrtime.bigint();

  // Continuously read RF signal and send data to main thread
  setInterval(() => {
    const currentTime = process.hrtime.bigint();
    const timeDiff = (currentTime - lastTime) / BigInt(1000); // Convert to microseconds

    const value = rfReceiver.getValue();
    parentPort?.postMessage({ value, timeDiff: Number(timeDiff) });

    lastTime = currentTime; // Update last time for next comparison
  }, 1); // 100ms (adjust based on your needs)
}
