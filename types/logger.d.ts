
/**
 * logger interface.
 */
export interface BpLogger {
  error(...msg:any[]): any
  info(...msg:any[]): any
  warn(...msg:any[]): any
  debug(...msg:any[]): any
}

/**
 * log level.
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
* @desc 获取error的文本.
*/
export function getErrorMessage(e: Error|any): string;