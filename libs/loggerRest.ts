'use strict';


/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-03 15:58
* Desc: 
*/

import { BpLogger } from "../types/logger";
import * as febs from 'febs';
import * as bplogger from './logger';
import { getErrorMessage } from "./utils";

const BP_LOG_LEVEL_REST = Symbol('BP_LOG_LEVEL_REST');
const BP_LOG_LEVEL_FEIGN = Symbol('BP_LOG_LEVEL_FEIGN');

/**
 * Rest log level.
 */
export enum RestLogLevel {
  /** no logging */
  NONE = 'NONE',
  /** Log only the request method and URL and the response status code and execution time. */
  BASIC = 'BASIC',
  /** Log the basic information along with request and response headers */
  HEADERS = 'HEADERS',
  /** Log the headers, body, and metadata for both requests and responses */
  FULL = 'FULL',
}

export function setFeignLoggerLevel(level: RestLogLevel) {
  (global as any)[BP_LOG_LEVEL_FEIGN] = (level || RestLogLevel.BASIC).toUpperCase();
}

export function setRestLoggerLevel(level: RestLogLevel) {
  (global as any)[BP_LOG_LEVEL_REST] = (level || RestLogLevel.BASIC).toUpperCase();
}

export function logRest(
  request: {
    method: string,
    headers: any,
    body: any,
    url: string,
    ip: string;
  }, response: {
    headers: any;
    status: number;
    body: any;
    err?: any;
  }, interval:number)
{
  const logger: BpLogger = bplogger.getLogger();
  const logLevel: RestLogLevel = (global as any)[BP_LOG_LEVEL_REST] || RestLogLevel.BASIC;

  try {
    // none.
    if (logLevel == RestLogLevel.NONE) {
      return;
    }
    // basic.
    else if (logLevel == RestLogLevel.BASIC) {
      logger.info(logBasic('[RestController]', request.ip, request, response, interval, null));
    }
    // headers.
    else if (logLevel == RestLogLevel.HEADERS) {
      logger.info(logHeaders('[RestController]', request.ip, request, response, interval, false, null));
    }
    // full.
    else if (logLevel == RestLogLevel.FULL) {

      if (response && response.body) {
        response = febs.utils.mergeMap(response, { body: getErrorMessage(response.body) });
      }

      logger.info(logFull('[RestController]', request.ip, request, response, interval));
    }
  } catch (e) {
    console.error('logRest error');
    console.error(getErrorMessage(e));
  }
}

export function logFeignClient(
  request: {
    method: string,
    headers: any,
    body: any,
    url: string
  }, response: {
    headers: any;
    status: number;
    body: any;
    err?: any;
  }, interval:number)
{
  const logger: BpLogger = bplogger.getLogger();
  const logLevel: RestLogLevel = (global as any)[BP_LOG_LEVEL_FEIGN] || RestLogLevel.BASIC;

  try {
    // none.
    if (logLevel == RestLogLevel.NONE) {
      return;
    }
    // basic.
    else if (logLevel == RestLogLevel.BASIC) {
      logger.info(logBasic('[FeignClient]', '0.0.0.0', request, response, interval, null));
    }
    // headers.
    else if (logLevel == RestLogLevel.HEADERS) {
      logger.info(logHeaders('[FeignClient]', '0.0.0.0', request, response, interval, false, null));
    }
    // full.
    else if (logLevel == RestLogLevel.FULL) {
      logger.info(logFull('[FeignClient]', '0.0.0.0', request, response, interval));
    }
  } catch (e) {
    console.error('logFeignClient error');
    console.error(getErrorMessage(e));
  }
}

function logBasic(prefix:string, ip:string, request:any, response:any, interval:number, cb: (msg:string) => string):string {
  let msg = prefix + '\n' +  `[${ip}] ---> ${request.method} ${decodeURIComponent(request.url)} HTTP/1.1\n`;
  if (cb) {
    msg = cb(msg);
  }

  if (!response.err) {
    msg += `[${ip}] <--- HTTP/1.1 ${response.status} (${interval}ms)\n`;
  }
  else {
    msg += getErrorMessage(response.err);
  }
  return msg;
}

function logHeaders(prefix:string, ip:string, request: any, response: any, interval:number, showBody:boolean, cb: (msg:string) => string):string {
  let msg = logBasic(prefix, ip, request, response, interval, (msg1) => {
    // headers/
    if (request.headers) {
      for (const key in request.headers) {
        let val = request.headers[key];
        if (!Array.isArray(val)) val = [val];
        for (let i = 0; i < val.length; i++) {
          msg1 += ` ${key}: ${val[i]}\n`;
        }
      }
    }
    // body.
    if (showBody) {
      if (request.body) {
        msg1 += (`[content]\n`);
        if (typeof request.body === 'object') {
          let contentType;
          if (typeof request.headers.get === 'function') {
            contentType = request.headers.get('content-type') || null;
          }
          else {
            contentType = request.headers['content-type'] || null;
          }

          if (Array.isArray(contentType)) { contentType = contentType[0]; }
          contentType = contentType ? contentType.toLowerCase() : 'application/json';
          if (contentType.indexOf('application/json') >= 0) {
            msg1 += JSON.stringify(request.body) + '\n';
          }
          else {
            msg1 += (` blob...\n`);
          }
        }
        else {
          msg1 += (request.body) + '\n';
        }
      }
    } // if.

    msg1 += `[${ip}] ---> END HTTP\n`;
    return msg1;
  });

  if (response.err) {
    return msg;
  }

  // response headers.
  if (response.headers) {
    if (typeof response.headers.forEach === 'function') {
      response.headers.forEach(function (val: any, key: string) {
        if (!Array.isArray(val)) val = [val];
        for (let i = 0; i < val.length; i++) {
          msg += (` ${key}: ${val[i]}\n`);
        }
      });
    }
    else {
      for (const key in response.headers) {
        let val = response.headers[key];
        if (!Array.isArray(val)) val = [val];
        for (let i = 0; i < val.length; i++) {
          msg += (` ${key}: ${val[i]}\n`);
        }
      }
    }
  }

  if (cb) {
    msg = cb(msg);
  }

  // response body.
  msg += `[${ip}] <--- END HTTP\n`;
  return msg;
}

function logFull(prefix:string, ip:string, request: any, response: any, interval:number):string {
  return logHeaders(prefix, ip, request, response, interval, true, (msg) => {

    if (response.err) {
      return msg;
    }
    
    msg += (`[content]\n`);
    // response body
    if (response.body) {
      
      if (typeof response.body === 'object') {
        let contentType;
        if (typeof response.headers.get === 'function') {
          contentType = response.headers.get('content-type') || null;
        }
        else {
          contentType = response.headers['content-type'] || null;
        }

        if (Array.isArray(contentType)) { contentType = contentType[0]; }
        contentType = contentType ? contentType.toLowerCase() : 'application/json';
        if (contentType.indexOf('application/json') >= 0) {
          msg += JSON.stringify(response.body) + '\n';
        }
        else {
          msg += (` blob...\n`);
        }
      }
      else {
        msg += (response.body) + '\n';
      }
    }
    return msg;
  });
}