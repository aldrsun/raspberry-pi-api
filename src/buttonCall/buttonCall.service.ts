import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { tableCodes } from './tableCodes.mapping';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ButtonCallService {
  constructor(private readonly httpService: HttpService) {}
  async handleButtonCall(code: number) {
    const tableEntry = Object.entries(tableCodes).find(
      ([, value]) => value.call_code === code || value.cancel_code === code,
    );
    if (!tableEntry) {
      console.log('Button code not found');
      throw new HttpException('Button Not Found.', HttpStatus.NOT_FOUND);
    }
    console.log('Button Found.');

    const [tableName, { call_code, cancel_code }] = tableEntry;
    const apiUrl =
      process.env.REMOTE_HOST + ':' + process.env.REMOTE_PORT + '/button-calls';
    if (code == call_code) {
      console.log('New Call!', tableName, call_code);
      try {
        await lastValueFrom(
          this.httpService.post(
            apiUrl,
            { location: '2', tableName: tableName },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: process.env.AUTH_TOKEN,
              },
            },
          ),
        ).then((r) => {
          console.log(r.data);
        });
      } catch (error) {
        console.log(error.status);
        throw new HttpException(
          'Error: Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else if (code == cancel_code) {
      console.log('Cancel Call!', tableName, cancel_code);
      try {
        await lastValueFrom(
          this.httpService.patch(
            apiUrl,
            { location: '2', tableName: tableName },
            {
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        ).then((r) => {
          console.log(r.data);
        });
      } catch (error) {
        console.log(error.status);
        throw new HttpException(
          'Error: Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return HttpStatus.OK;
  }
}
