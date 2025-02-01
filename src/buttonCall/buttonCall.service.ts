import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      throw new HttpException('Button Not Found.', HttpStatus.NOT_FOUND);
    }

    const [tableName, { call_code, cancel_code }] = tableEntry;
    if (code == call_code) {
      console.log('New Call!', tableName, call_code);
    } else if (code == cancel_code) {
      console.log('Cancel Call!', tableName, cancel_code);
    }

    return HttpStatus.OK;
  }
}
