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

  private getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  async handleButtonCall(code: number) {
    const tableEntry = Object.entries(tableCodes).find(
      ([, value]) => value.call_code === code || value.cancel_code === code,
    );
    if (!tableEntry) {
      console.log(
        '%s \x1b[1;31m%s\x1b[0m',
        this.getCurrentTime(),
        'Button code not found',
      );
      console.log('%s Code: \x1b[1;33m%s\x1b[0m', this.getCurrentTime(), code);
      throw new HttpException('Button Not Found.', HttpStatus.NOT_FOUND);
    }

    const [tableName, { call_code, cancel_code }] = tableEntry;
    if (code == call_code) {
      console.log(
        '%s \x1b[32mNew call to \x1b[1;32mButton \x1b[1;33m%s\x1b[0;32m with code \x1b[0m%s',
        this.getCurrentTime(),
        tableName,
        call_code,
      );
      try {
        await lastValueFrom(
          this.httpService
            .post(
              this.remoteUrl,
              {
                hour: this.getCurrentTime(),
                location: 2,
                tableName: tableName,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: process.env.AUTH_TOKEN,
                },
              },
            )
            .pipe(timeout(10000)),
        ).then((r) => {
          console.log(
            '%s \x1b[1;32m%s\x1b[0m',
            this.getCurrentTime(),
            'Server handled the call successfully.',
          );
        });
      } catch (error) {
        console.log(
          '%s \x1b[1;31mError from remote host \x1b[0;31m%s: %s\x1b[0m',
          this.getCurrentTime(),
          error.status ?? 'error status undefined',
          error.message ?? 'error message undefined',
        );
        throw new HttpException(
          'Error: Something went wrong with remote host',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else if (code == cancel_code) {
      console.log(
        '%s \x1b[32mNew cancel to \x1b[1;32mButton \x1b[1;33m%s\x1b[0;32m with code\x1b[0m%s',
        this.getCurrentTime(),
        tableName,
        cancel_code,
      );
      try {
        await lastValueFrom(
          this.httpService
            .patch(
              this.remoteUrl,
              {
                hour: this.getCurrentTime(),
                location: 2,
                tableName: tableName,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: process.env.AUTH_TOKEN,
                },
              },
            )
            .pipe(timeout(10000)),
        ).then((r) => {
          console.log(
            '%s \x1b[1;32m%s\x1b[0m',
            this.getCurrentTime(),
            'Server handled the cancel successfully.',
          );
        });
      } catch (error) {
        console.log(
          '%s \x1b[1;31mError from remote host \x1b[0;31m%s: %s\x1b[0m',
          this.getCurrentTime(),
          error.status ?? 'error status undefined',
          error.message ?? 'error message undefined',
        );
        throw new HttpException(
          'Error: Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return HttpStatus.OK;
  }

  async transmit(location: number, tableName: string) {
    console.log(
      '\x1b[0;32mTransmit request received with Button \x1b[1;33m%s\x1b[0;2m and Location \x1b[1;33m%s\x1b[0m',
      tableName,
      location,
    );

    if (location != 2) {
      throw new HttpException('Unsupported location', HttpStatus.NOT_FOUND);
    }

    const tableEntry = Object.entries(tableCodes).find(
      ([value]) => value === tableName,
    );
    if (!tableEntry) {
      throw new HttpException('Unsupported table', HttpStatus.NOT_FOUND);
    }
    try {
      await lastValueFrom(
        this.httpService
          .post(
            this.transmitUrl,
            { code: tableEntry[1]['cancel_code'] },
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
      console.log(
        '%s \x1b[32mError from local transmit host \x1b[1;31m%s: %s\x1b[0m',
        this.getCurrentTime(),
        error.status ?? 'error status undefined',
        error.message ?? 'error message undefined',
      );

      throw new HttpException(
        'Error: Something went wrong with transmit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
