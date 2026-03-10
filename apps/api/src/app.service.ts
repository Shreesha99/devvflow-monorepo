import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getSystemInfo() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      app: 'DevvDeck API',
      status: 'Operational',
      uptime: uptimeSeconds,
      framework: 'NestJS',
      developer: 'Shreesha Venkatram',
      developerUrl: 'https://www.cvshreesha.in/',
      year: new Date().getFullYear(),
    };
  }
}
