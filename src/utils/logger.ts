// app-logger.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { LogEvent, loggingSubject } from 'src/logging-stream';

@Injectable()
export class LoggerService implements OnModuleDestroy {
  private subscription: Subscription;

  constructor() {
    console.log(`Custom Development Logger instantiated!`);

    // Subscribe to global logging observable
    this.subscription = loggingSubject.subscribe((event: LogEvent) => {
      const context = event.target.constructor?.name || 'App';
      const output = event.data !== undefined 
        ? `${event.message} | Data: ${JSON.stringify(event.data)}`
        : event.message;

      switch (event.level) {
        case 'log':
          console.log(`${context}: ${output}`);
          break;
        case 'warn':
          console.warn(`${context}: ${output}`);
          break;
        case 'error':
          console.error(`${context}: ${output}`);
          break;
        case 'debug':
          console.debug(`${context}: ${output}`);
          break;
      }
    });
  }

  onModuleDestroy() {
    this.subscription.unsubscribe();
  }
}
