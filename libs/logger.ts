'use strict';


/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-03 15:58
* Desc: 
*/

import { BpLogger } from "../types/logger";
import { getErrorMessage } from "./utils";

const BP_LOGGER_INSTANCE = Symbol('BP_LOGGER_INSTANCE');
const BP_LOG_LEVEL = Symbol('BP_LOG_LEVEL');


export const LOG_TAG = '[bpframework] ';

const DefaultLogger = {
  error(...msg:any[]) {
    console.error(...msg);
  },
  info(...msg:any[]) {
    console.log(...msg);
  },
  warn(...msg:any[]) {
    console.warn(...msg);
  },
  debug(...msg:any[]) {
    console.debug(...msg);
  }
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
* @desc 获得日志对象.
*/
export function getLogger():BpLogger {
  return getLoggerInstance();
}

/**
* @desc 设置日志对象.
*/
export function setLogger(logger: BpLogger) {
  (global as any)[BP_LOGGER_INSTANCE] = logger;
}

/**
* @desc 获得日志级别.
*/
export function getLogLevel():LogLevel {
  return (global as any)[BP_LOG_LEVEL] || LogLevel.DEBUG;
}

/**
* @desc 设置日志级别.
*/
export function setLogLevel(level: LogLevel) {
  (global as any)[BP_LOG_LEVEL] = level || LogLevel.DEBUG;
}

/**
 * default logger.
 */
function getLoggerInstance() {
  return {
    error(...msg: any[]) {
      const logger: BpLogger = (global as any)[BP_LOGGER_INSTANCE] || DefaultLogger;
      let m:string = '';
      for (let i = 0; i < msg.length; i++) { m += getErrorMessage(msg[i]) + ' '; }
      logger.error(m);
    },
    info(...msg: any[]) {
      const logLevel: LogLevel = (global as any)[BP_LOG_LEVEL];
      if (logLevel == LogLevel.WARN || logLevel == LogLevel.ERROR) {
        return;
      }
      const logger: BpLogger = (global as any)[BP_LOGGER_INSTANCE] || DefaultLogger;
      let m:string = '';
      for (let i = 0; i < msg.length; i++) { m += getErrorMessage(msg[i]) + ' '; }
      logger.info(m);
    },
    warn(...msg: any[]) {
      const logLevel: LogLevel = (global as any)[BP_LOG_LEVEL];
      if (logLevel == LogLevel.ERROR) {
        return;
      }
      const logger: BpLogger = (global as any)[BP_LOGGER_INSTANCE] || DefaultLogger;
      let m:string = '';
      for (let i = 0; i < msg.length; i++) { m += getErrorMessage(msg[i]) + ' '; }
      logger.warn(m);
    },
    debug(...msg: any[]) {
      const logLevel: LogLevel = (global as any)[BP_LOG_LEVEL];
      if (logLevel == LogLevel.DEBUG) {
        const logger: BpLogger = (global as any)[BP_LOGGER_INSTANCE] || DefaultLogger;
        let m:string = '';
        for (let i = 0; i < msg.length; i++) { m += getErrorMessage(msg[i]) + ' '; }
        logger.debug(m);
      }
    }
  }
}
