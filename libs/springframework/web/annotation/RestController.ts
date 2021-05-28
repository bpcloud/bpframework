'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-10-22 18:15
 * Desc:
 */

import 'reflect-metadata'
import * as febs from 'febs'
import { RestRequest, RestResponse } from '@/types/springframework/rest_request.d';
import { getServiceInstances, Service } from '../../Service';
import { logRest, RestLogLevel, setRestLoggerLevel } from '../../../loggerRest';
import urlUtils from '../../../utils/urlUtils';
import objectUtils from '../../../utils/objectUtils';

// import * as qs from 'querystring';
var qs = require('../../../utils/qs/dist');

const DefaultRestControllerCfg = Symbol('DefaultRestControllerCfg')
const RestControllerRouters = Symbol('RestControllerRouters')

const _RestControllerRouterMetadataKey = Symbol('_RestControllerRouterMetadataKey')
export const _RestControllerMetadataKey = Symbol('_RestControllerMetadataKey')


type _RestControllerRouterType = {
  target: any,
  serviceInstance: any,
  functionPropertyKey: string | symbol,
  params: {
    name?: string;
    required?: boolean;
    parameterIndex?: number;
    defaultValue?: any;
    type: "pv" | "rb" | "rp" | "ro";
  }[],
  pathVars?: {[name:string]:number},
  reg?: RegExp,
  path?: string,
  method: string,
};

/**
* @desc 获得所有的路由.
*/
function getRestControllerRouters(): _RestControllerRouterType[] {
  let routers = (global as any)[RestControllerRouters];
  if (!routers) {
    routers = [];
    (global as any)[RestControllerRouters] = routers;
  }
  return routers;
}

/**
 * @desc: 设置默认的配置. 可用于全局response消息的处理等.
 */
export function setRestControllerDefaultCfg(cfg: {
  /** 日志级别. */
  logLevel?: RestLogLevel,
  /** 如果response对象中不存在对应的header, 则附加的header */
  headers?: { [key: string]: string|string[] },
  /** 处理controller处理方法返回的对象returnMessage, 并返回需要response到请求端的内容 */
  filterMessageCallback?: (returnMessage: any, requestUrl: string) => any,
  /** 接收消息时发生数据类型等错误. */
  errorRequestCallback?: (error:Error, request:RestRequest, response:RestResponse ) => void,
  /** 响应消息时发生错误. */
  errorResponseCallback?: (error:Error, request:RestRequest, response:RestResponse ) => void,
  /** 404. */
  notFoundCallback?: (request:RestRequest, response:RestResponse ) => void,
}) {

  if (cfg.hasOwnProperty('logLevel')) {
    setRestLoggerLevel(cfg.logLevel);
  }

  let c = (global as any)[DefaultRestControllerCfg]
  if (!c) {
    c = {};
    (global as any)[DefaultRestControllerCfg] = c;
  }
  if (cfg.hasOwnProperty('filterMessageCallback')) {
    c.filterMessageCallback = cfg.filterMessageCallback
  }
  if (cfg.hasOwnProperty('errorRequestCallback')) {
    c.errorRequestCallback = cfg.errorRequestCallback
  }
  if (cfg.hasOwnProperty('errorResponseCallback')) {
    c.errorResponseCallback = cfg.errorResponseCallback
  }
  if (cfg.hasOwnProperty('notFoundCallback')) {
    c.notFoundCallback = cfg.notFoundCallback
  }
  if (cfg.hasOwnProperty('headers')) {
    c.headers = febs.utils.mergeMap(cfg.headers);
  }
}

function getRestControllerDefaultCfg(): {
  headers?: { [key: string]: string|string[] },
  filterMessageCallback?: (returnMessage:any, requestUrl: string)=>any,
  errorRequestCallback?: (error:Error, request:RestRequest, response:RestResponse ) => any,
  errorResponseCallback?: (error:Error, request:RestRequest, response:RestResponse ) => any,
  notFoundCallback?: (request:RestRequest, response:RestResponse ) => any,
} {
  let cfg = (global as any)[DefaultRestControllerCfg]
  cfg = cfg || {}
  return cfg
}

/**
 * @desc 表明指定的类为RestController类.
 *
 * @returns {ClassDecorator}
 */
export function RestController(cfg?: {
  /** 定义RestController类中请求的统一前缀 */
  path?: string
}): ClassDecorator {
  cfg = cfg || {};
  cfg.path = cfg.path || ''

  let fooService = Service();

  return (target: Function): void => {
    fooService(target);
      
    // store routers.
    let routers: _RestControllerRouterType[] = Reflect.getOwnMetadata(_RestControllerRouterMetadataKey, target);
    if (routers) {
      let globalRouters = getRestControllerRouters();
      for (let p in routers) {
        let val = routers[p];
        let pp = urlUtils.join(cfg.path, val.path);
        let pps = pp.split('/');
        pp = '';
        for (let i in pps) {
          let ppsi = pps[i];
          
          if (pp.length > 0 && pp[pp.length - 1] != '/') {
            pp += '/';
          }
          if (ppsi.length != 0) {
            if (ppsi.length > 2) {
              if (ppsi[0] == '{' && ppsi[ppsi.length - 1] == '}') {
                pp += ppsi;
              }
              else {
                pp += encodeURIComponent(ppsi);
              }
            }
            else {
              pp += encodeURIComponent(ppsi);
            }
          }
          else if (pp.length == 0) {
            pp += '/';
          }
        }
        let reg = getPathReg(pp, val.params);
        val.reg = reg.reg;
        val.pathVars = reg.pathVars;
        val.target = target;
        // delete val.path;
        globalRouters.push(val);
      }
    } // if.

    Reflect.defineMetadata(
      _RestControllerMetadataKey,
      {},
      target
    )
  }
}

/**
* @desc 处理请求; 
* @description 在web框架收到http请求时, 调用此接口后将会触发指定的RestController进行处理. 当匹配到一个处理后即中断后续匹配.
* @return 返回null表明未匹配到适当的router.
*/
export async function CallRestControllerRoute(
  request: RestRequest,
  ctx: any,
): Promise<RestResponse> {
  
  let interval: number = Date.now();

  let rotuers = getRestControllerRouters();
  if (!rotuers) {
    return Promise.resolve(null);
  }

  let pathname: string = request.url;
  
  // qs
  let querystring: any = null;
  let qsPos = pathname.indexOf('?');
  if (qsPos >= 0) {
    querystring = pathname.substr(qsPos + 1);
    if (!febs.string.isEmpty(querystring)) {
      querystring = decodeURIComponent(querystring);
      querystring = qs.parse(querystring);
    }
    pathname = pathname.substr(0, qsPos);
  }

  let cfg = getRestControllerDefaultCfg();

  for (let i = 0; i < rotuers.length; i++) {
    let router = rotuers[i];
    if (router.method == request.method.toLowerCase() && router.reg.test(pathname)) {

      let response = {
        headers: {},
        status: 200,
        body: null as any
      }

      let matchInfo = { match: true, requestError: null as Error, responseError: null as Error };
      let ret;
      try {

        let target: any;
        if (router.serviceInstance) {
          target = router.serviceInstance;
        } else {
          target = router.serviceInstance = getServiceInstances(router.target).instance;
          router.target = null;
        }

        ret = target[router.functionPropertyKey].call(target, {
          pathname: decodeURIComponent(pathname),
          querystring,
          request,
          response,
          params: router.params,
          pathVars: router.pathVars,
        }, matchInfo, ctx);

        if (ret instanceof Promise) {
          ret = await ret;
        }
      }
      catch (err) {
        matchInfo.responseError = err;
      }
      
      // requestError.
      if (matchInfo.requestError) {
        response.status = 400;
        interval = Date.now() - interval;
        logRest(request, { err: '[Error] request error' } as any, interval);
        if (cfg.errorRequestCallback) {
          cfg.errorRequestCallback(matchInfo.requestError, request, response);
        }
        return Promise.resolve(response);
      }

      // responseError.
      if (matchInfo.responseError) {
        response.status = 500;
        interval = Date.now() - interval;
        logRest(request, { err: '[Error] response error' } as any, interval);
        if (cfg.errorResponseCallback) {
          cfg.errorResponseCallback(matchInfo.responseError, request, response);
        }
        return Promise.resolve(response);
      }

      // 404.
      if (!matchInfo.match) {
        interval = Date.now() - interval;
        logRest(request, { err: '[404] Route matched, but condition not satisfied: ' + request.url } as any, interval);
        response.status = 404;
        if (cfg.notFoundCallback) {
          cfg.notFoundCallback(request, response);
        }
        return Promise.resolve(response);
      }

      if (!response.body) {
        if (cfg.filterMessageCallback) {
          ret = cfg.filterMessageCallback(ret, request.url);
        }
        response.body = ret;
      }

      interval = Date.now() - interval;
      logRest(request, response, interval);
      return Promise.resolve(response);
    }
  } // for.

  interval = Date.now() - interval;
  logRest(request, { err: '[404] Route is not match: ' + pathname } as any, interval);

  // response.
  let response1 = {
    headers: {} as any,
    status: 404,
    body: null as any
  }
  if (cfg.notFoundCallback) {
    // save headers.
    const defaultHeaders = febs.utils.mergeMap(cfg.headers);
    if (defaultHeaders) {
      for (const key in defaultHeaders) {
        response1.headers[key] = defaultHeaders[key];
      }
    }
    
    cfg.notFoundCallback(request, response1);
  }
  return Promise.resolve(response1);
}

/**
* @desc 返回值表明是否能够按照参数规则处理.
* @return 
*/
export function _RestControllerDo(
  target: Object,
  ctx: any,
  matchInfo: { match: boolean, requestError: Error, responseError: Error },
  headers: { [key: string]: string|string[] } | (()=>{ [key: string]: string|string[] }),
  castType: any,
  args: IArguments,
  pathname: string,
  querystring: any,
  request: RestRequest,
  response: RestResponse,
  params: {
    name?: string;
    required?: boolean;
    parameterIndex?: number;
    defaultValue?: any;
    castType: any,
    type: "pv" | "rb" | "rp" | "ro";
  }[],
  pathVars?: {[name:string]:number},
): boolean {

  if (headers && typeof headers === 'function') {
    headers = headers();
  }
  
  // save headers.
  const defaultHeaders = febs.utils.mergeMap(getRestControllerDefaultCfg().headers, headers);
  if (defaultHeaders) {
    for (const key in defaultHeaders) {
      response.headers[key] = defaultHeaders[key];
    }
  }

  args.length = 0;
  if (params) {
    for (let i in params) {
      let param = params[i];
      if (args.length <= param.parameterIndex) {
        args.length = param.parameterIndex + 1;
      }

      // pathVariable.
      if (param.type == 'pv') {
        let index = pathVars['{' + param.name + '}'];
        if (!febs.utils.isNull(index)) {
          let data = pathname.split('/')[index];
          if (data) { data = decodeURIComponent(data); }
          else if (param.required) {
            matchInfo.requestError = new febs.exception(`parameter "${param.name}" is required`, febs.exception.PARAM, __filename, __line, __column);
            return false;
          }

          let datar = objectUtils.castType(data, param.castType, true);
          if (datar.e) {
            matchInfo.requestError = datar.e;
            return false;
          }
          else {
            args[param.parameterIndex] = datar.data;
          }
        }
      }
      // requestBody.
      else if (param.type == 'rb') {
        if (!request.body) {
          if (param.required) {
            matchInfo.requestError = new febs.exception(`requestBody is required`, febs.exception.PARAM, __filename, __line, __column);
            return false;
          }
          args[param.parameterIndex] = null;
        }
        else {
          let datar = objectUtils.castType(request.body, param.castType, false);
          if (datar.e) {
            matchInfo.requestError = datar.e;
            return false;
          }
          else {
            args[param.parameterIndex] = datar.data;
          }
        }
      }
      // requestParam.
      else if (param.type == 'rp') {
        if (!querystring || !querystring.hasOwnProperty(param.name)) {
          if (param.required && !param.defaultValue) {
            matchInfo.requestError = new febs.exception(`parameter "${param.name}" is required`, febs.exception.PARAM, __filename, __line, __column);
            return false;
          }
          args[param.parameterIndex] = param.defaultValue;
        }
        else {
          let data = querystring[param.name];

          let datar = objectUtils.castType(data, param.castType, false);
          if (datar.e) {
            matchInfo.requestError = datar.e;
            return false;
          }
          else {
            args[param.parameterIndex] = datar.data;
          }
        } 
      }
      // restObject.
      else if (param.type == 'ro') {
        args[param.parameterIndex] = {
          request,
          response,
          responseMsg: null,
          error: null,
          ctx,
        };
      }
    } // for.
  } // if.

  return true;
}

/**
 * 获得path的正则表达式.
 * @param path 
 */
function getPathReg(p: string, params: {
    name?: string;
    required?: boolean;
    parameterIndex?: number;
    defaultValue?: any;
    type: "pv" | "rb" | "rp" | "ro";
}[]): { reg: RegExp, pathVars: { [name: string]: number } } {
  params = params || [];
  if (p[0] != '/') p = '/' + p;
  if (p[p.length - 1] == '/') p = p.substr(0, p.length - 1);
  p = febs.string.replace(p, '\\', '\\\\');
  p = febs.string.replace(p, '[', '\[');
  p = febs.string.replace(p, ']', '\]');
  p = febs.string.replace(p, '(', '\(');
  p = febs.string.replace(p, ')', '\)');
  p = febs.string.replace(p, '{', '\{');
  p = febs.string.replace(p, '}', '\}');
  p = febs.string.replace(p, '|', '\|');
  p = febs.string.replace(p, '^', '\^');
  p = febs.string.replace(p, '?', '\?');
  p = febs.string.replace(p, '.', '\.');
  p = febs.string.replace(p, '+', '\+');
  p = febs.string.replace(p, '*', '\*');
  p = febs.string.replace(p, '$', '\$');
  p = febs.string.replace(p, ':', '\:');
  p = febs.string.replace(p, '-', '\-');
  let pathVars = {} as any;
  let segs = p.split('/');

  p = '';

  let pvHadRequired = true;
  for (let i = 0; i < segs.length; i++) {
    if (segs[i].length == 0) continue;

    p += '(\\/';

    if (/^\{[a-zA-Z\$_][a-zA-Z\d_]*\}$/.test(segs[i])) {
      p += "[\\w\\~\\!\\*\\(\\)\\-\\_\\'\\.\\%\\@\\$\\&\\+\\=\\[\\]\\;\\:\\,]+" + ")";

      // required.
      let j;
      for (j = 0; j < params.length; j++) {
        if (params[j].type == 'pv' && '{' + params[j].name + '}' == segs[i]) {
          if (!params[j].required) {
            pvHadRequired = false;
            p += '?';
          }
          else if (!pvHadRequired) {
            throw new Error(`@PathVariable '${params[j].name}': required cannot be 'true', pre-pathVariable required=false`);
          }
          break;
        }
      }
      pathVars[segs[i]] = i;
    }
    else {
      p += segs[i] + ')';
    }
  }
  p = '^' + p + '\\/?(\\?.*)?$';
  return { reg: new RegExp(p), pathVars };
}


/**
 * @desc 将router信息存储到target.
 */
export function _RestControllerPushRouter(targetObject: Object, target: Function, cfg: {
  path: string | string[],
  functionPropertyKey: string | symbol,
  params: {
    name?: string;
    required?: boolean;
    parameterIndex?: number;
    defaultValue?: any;
    type: "pv" | "rb" | "rp" | "ro";
  }[],
  method: string,
}): void {

  let routers: _RestControllerRouterType[] = Reflect.getOwnMetadata(_RestControllerRouterMetadataKey, target) || [];
  if (Array.isArray(cfg.path)) {
    for (let i = 0; i < cfg.path.length; i++) {
      routers.push({
        target: targetObject,
        serviceInstance: null,
        functionPropertyKey: cfg.functionPropertyKey,
        params: cfg.params,
        path: cfg.path[i],
        method: cfg.method.toLowerCase(),
      })
    }
  }
  else {
    routers.push({
      target: targetObject,
      serviceInstance: null,
      functionPropertyKey: cfg.functionPropertyKey,
      params: cfg.params,
      path: cfg.path,
      method: cfg.method.toLowerCase(),
    });
  }

  Reflect.defineMetadata(
    _RestControllerRouterMetadataKey,
    routers,
    target
  )
}