import { Injectable } from '@nestjs/common';
import { Gpio } from 'onoff';

@Injectable()
export class RfService {
  private rfReceiver: Gpio;

  constructor() {
    this.rfReceiver = new Gpio(12, 'in', 'both');

    this.rfReceiver.watch((err, value) => {
      if (err) {
        console.error('Error reading RF signal:', err);
        return;
      }
      console.log(`Received RF signal: ${value}`);
    });
  }
}
