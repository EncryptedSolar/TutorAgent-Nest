// logging-stream.ts
import { Subject } from 'rxjs';

export interface LogEvent {
  target: any;       // usually 'this' from the class
  message: string;
  data?: any;
  level: 'log' | 'warn' | 'error' | 'debug';
}

export const loggingSubject = new Subject<LogEvent>();
