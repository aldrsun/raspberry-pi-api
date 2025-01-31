import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Gpio } from 'pigpio';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RfService implements OnModuleInit, OnModuleDestroy {
  private readonly RF_PIN = 12; // GPIO pin for RF receiver
  private rfReceiver: Gpio;
  private filePath = path.join(__dirname, 'rf_signals.txt'); // Path to save data

  onModuleInit() {
    console.log('Initializing RF receiver...');
    this.rfReceiver = new Gpio(this.RF_PIN, { mode: Gpio.INPUT, alert: true });

    this.rfReceiver.on('alert', (level, tick) => {
      this.saveRfSignalToFile(level, tick);
    });
  }

  onModuleDestroy() {
    console.log('Cleaning up RF receiver...');
    this.rfReceiver.digitalWrite(0); // Turn off the pin
  }

  // Method to save RF signal data to a file
  private saveRfSignalToFile(level: number, tick: number) {
    const data = `${level}, ${tick}\n`;

    try {
      // Append the RF signal data to the file
      fs.appendFile(this.filePath, data, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        } else {
          console.log('RF signal saved to file');
        }
      });
    } catch (error) {
      console.error('Error saving RF signal:', error);
    }
  }
}
