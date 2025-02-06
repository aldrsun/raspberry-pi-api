import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { tableCodes } from './tableCodes.mapping';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, timeout } from 'rxjs';

@Injectable()
export class ButtonCallService {
  private readonly transmitUrl: string;
  private readonly remoteUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.transmitUrl = process.env.TRANSMIT_URL ?? '';
    this.remoteUrl = process.env.REMOTE_URL ?? '';
  }

  async handleButtonCall(code: number) {
    const tableEntry = Object.entries(tableCodes).find(
      ([, value]) => value.call_code === code || value.cancel_code === code,
    );
    if (!tableEntry) {
      console.log('Button code not found');
      console.log('code: ', code);
      throw new HttpException('Button Not Found.', HttpStatus.NOT_FOUND);
    }
    console.log('Button Found.');

    const [tableName, { call_code, cancel_code }] = tableEntry;
    if (code == call_code) {
      console.log('New Call!', tableName, call_code);
      try {
        await lastValueFrom(
          this.httpService
            .post(
              this.remoteUrl,
              { location: '2', tableName: tableName },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: process.env.AUTH_TOKEN,
                },
              },
            )
            .pipe(timeout(5000)),
        ).then((r) => {
          console.log(r.data);
        });
      } catch (error) {
        console.log(error.status);
        throw new HttpException(
          'Error: Something went wrong with remote host',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else if (code == cancel_code) {
      console.log('Cancel Call!', tableName, cancel_code);
      try {
        await lastValueFrom(
          this.httpService
            .patch(
              this.remoteUrl,
              { location: location, tableName: tableName },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: process.env.AUTH_TOKEN,
                },
              },
            )
            .pipe(timeout(10000)),
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

  async transmit(location: number, tableName: string) {
    if (location != 2) {
      throw new HttpException('Unsupported location', HttpStatus.NOT_FOUND);
    }

    const tableEntry = Object.entries(tableCodes).find(
      ([value]) => value === tableName,
    );
    if (!tableEntry) {
      throw new HttpException('Unsupported table', HttpStatus.NOT_FOUND);
    }
    console.log(tableEntry);
    console.log(this.transmitUrl);
    try {
      console.log(this.transmitUrl);
      await lastValueFrom(
        this.httpService
          .post(
            this.transmitUrl,
            { location: location, tableName: tableName },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(timeout(5000)),
      ).then((r) => {
        console.log(r.data);
      });
    } catch (error) {
      console.log(error.status);
      throw new HttpException(
        'Error: Something went wrong with transmit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
