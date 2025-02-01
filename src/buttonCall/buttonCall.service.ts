import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { tableCodes } from './tableCodes.mapping';

@Injectable()
export class ButtonCallService {
  handleButtonCall(code: number) {
    const tableEntry = Object.entries(tableCodes).find(
      ([, value]) => value.call_code === code || value.cancel_code === code,
    );
    if (!tableEntry) {
      console.log('Button code not found');
      return;
    }

    const [tableName, { call_code }] = tableEntry;
    console.log(tableName, call_code);
  }
}
