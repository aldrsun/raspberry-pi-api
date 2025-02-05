import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { tableCodes } from './tableCodes.mapping';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ButtonCallService {
  constructor(private readonly httpService: HttpService) {}
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
      try {
        const response = lastValueFrom(
          this.httpService.post(
            'http://localhost:3001/button-calls',
            { location: '2', tableName: tableName },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: process.env.AUTH_TOKEN,
              },
            },
          ),
        );

        console.log(response);
      } catch (error) {
        console.log(error);
      }
    } else if (code == cancel_code) {
      console.log('Cancel Call!', tableName, cancel_code);
      try {
        const response = lastValueFrom(
          this.httpService.patch(
            'http://localhost:3001/button-calls',
            { location: '2', tableName: tableName },
            {
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );

        console.log(response);
      } catch (error) {
        console.log(error);
      }
    }

    return HttpStatus.OK;
  }
}
