'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-10-22 18:15
 * Desc:
 */

import 'reflect-metadata'
import * as febs from 'febs'
import { Fetch } from 'febs/types/fetch.d'
import { getLogger } from '../../logger'
import { logFeignClient, RestLogLevel, setFeignLoggerLevel } from '../../loggerRest'
import urlUtils from '../../utils/urlUtils'
import objectUtils from '../../utils/objectUtils'
import { getLazyParameterValue } from '../../utils/paramUtils'
import { StringLazyParameter } from '../../../types/lazyParameter.d'
import { getErrorMessage } from '../../utils'
import { FeignDataType } from '../../../types'
import { _callFeignClient } from '../../decorators/configure/FeignClientConfigure'
// import * as qs from 'querystring';
var qs = require('../../utils/qs/dist');

const DefaultFeignClientCfg = Symbol('DefaultFeignClientCfg')
export const _FeignClientMetadataKey = Symbol('_FeignClientMetadataKey')

type _FeignClientMetadataType = {
  name: string
  url: StringLazyParameter
  path: string
}

export type MicroserviceInfo = {
  serviceName: string,
  ip: string,
  port: number,
  weight?: number,
  metadata?: any
}

/**
 * @desc: 设置默认的请求配置. 可用于设置fetch对象, 重试信息等.
 *
 *     负载均衡策略由 findServiceCallback 提供.
 *
 * @example
 *   import * as fetch from 'node-fetch'
 *   setFeignClientDefaultCfg({
 *      fetch:fetch,
 *      findServiceCallback(serviceName, excludeHost):Promise<MicroserviceInfo>=> {
 *        return Promise.resolve({ip, port, serviceName}); 
 *      }
 *   });
 */
export function setFeignClientDefaultCfg(cfg: {
  /** 网络请求对象, 当在back-end使用时需设置; 可使用 node-fetch等兼容api */
  fetch?: Fetch
  /** 最大更换实例次数; (默认3) */
  maxAutoRetriesNextServer?: number
  /** 同一实例的重试次数; (默认2) */
  maxAutoRetries?: number
  /** 每次请求需要附加的header */
  headers?: { [key: string]: string|string[] },
  /** 请求超时, 默认20000ms */
  timeout?: number,
  /** 日志级别. */
  logLevel?: RestLogLevel,
  /** 获取指定service的回调. */
  findServiceCallback: (
    serviceName: string,
    excludeHost: string
  ) => Promise<MicroserviceInfo>,
  /** 
   * 处理收到的对象receiveMessage, 将正确的结果存储至retureMessage中. 
   * 若抛出异常则表明消息错误, 将会由RestObject传递给controller.
   */
  filterMessageCallback?: (receiveMessage: any, returnMessage: any, requestService: string, requestUrl: string) => void,
  /** 在front-end使用时设置跨域等信息 */
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
}) {

  if (cfg.hasOwnProperty('logLevel')) {
    setFeignLoggerLevel(cfg.logLevel);
  }

  let c = (global as any)[DefaultFeignClientCfg]
  if (!c) {
    c = {};
    (global as any)[DefaultFeignClientCfg] = c;
  }
  if (cfg.hasOwnProperty('fetch')) {
    c.fetch = cfg.fetch
  }
  if (cfg.hasOwnProperty('maxAutoRetriesNextServer')) {
    c.maxAutoRetriesNextServer = cfg.maxAutoRetriesNextServer;
  }
  if (cfg.hasOwnProperty('maxAutoRetries')) {
    c.maxAutoRetries = cfg.maxAutoRetries;
  }
  if (cfg.hasOwnProperty('findServiceCallback')) {
    c.findServiceCallback = cfg.findServiceCallback
  }
  if (cfg.hasOwnProperty('filterMessageCallback')) {
    c.filterMessageCallback = cfg.filterMessageCallback
  }
  if (cfg.hasOwnProperty('mode')) {
    c.mode = cfg.mode
  }
  if (cfg.hasOwnProperty('headers')) {
    c.headers = febs.utils.mergeMap(cfg.headers);
  }
  if (cfg.hasOwnProperty('timeout')) {
    c.timeout = cfg.timeout
  }
  if (cfg.hasOwnProperty('credentials')) {
    c.credentials = cfg.credentials
  }
}

export function getFeignClientDefaultCfg(): {
  fetch?: Fetch
  maxAutoRetriesNextServer?: number
  maxAutoRetries?: number,
  headers?: { [key: string]: string|string[] },
  timeout?: number,
  findServiceCallback: (
    serviceName: string,
    excludeHost: string
  ) => Promise<MicroserviceInfo>,
  filterMessageCallback?: (receiveMessage: any, returnMessage: any, requestService: string, requestUrl: string) => void,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
} {
  let cfg = (global as any)[DefaultFeignClientCfg]
  cfg = cfg || {}
  cfg.fetch = cfg.fetch || febs.net.fetch
  cfg.maxAutoRetriesNextServer = cfg.maxAutoRetriesNextServer || 3
  cfg.maxAutoRetries = cfg.maxAutoRetries || 2
  cfg.timeout = cfg.timeout || 20000
  return cfg
}

/**
 * @desc 表明指定的类为feignClient类.
 *
 *      仅支持service返回格式为 application/json或application/x-www-form-urlencoded; 其他格式返回字节流
 *
 * @returns {ClassDecorator}
 */
export function FeignClient(cfg: {
  /** 指定微服务的名称 */
  name: string
  /** 用于调试, 指定调用的地址, 使用此地址通信. (必须设置 __debugFeignClient = true 才能生效) */
  url?: StringLazyParameter
  /** 定义FeignClient类中请求的统一前缀 */
  path?: string
}): ClassDecorator {

  if (febs.string.isEmpty(cfg.name)) {
    throw new Error(
      "@FeignClient need 'name' parameter")
  }
  cfg.path = cfg.path || ''

  return (target: Function): void => {
    Reflect.defineMetadata(
      _FeignClientMetadataKey,
      {
        name: cfg.name,
        url: cfg.url,
        path: cfg.path,
      },
      target
    )
  }
}

export async function _FeignClientDo(
  target: Object,
  requestMapping: any,
  feignData: FeignDataType,
  restObject: { parameterIndex: number },
  castType: any,
  args: IArguments,
  fallback: () => Promise<any>
):Promise<any> {
  if (requestMapping.path.length > 1) {
    throw new Error(
      "@RequestMapping in FeignClient class, 'path' must container only one url")
  }

  let meta: _FeignClientMetadataType = Reflect.getOwnMetadata(
    _FeignClientMetadataKey,
    target.constructor
  )

  let url = urlUtils.join(meta.path, requestMapping.path[0]);

  let feignClientCfg = getFeignClientDefaultCfg();
  if (typeof feignClientCfg.findServiceCallback !== 'function') {
    throw new Error(`feignClient 'findServiceCallback' must be a function`);
  }

  let excludeHost: string = null;
  let request: any;
  let response: any;
  let responseMsg: any;
  let lastError: any;

  let cfgurl = getLazyParameterValue(meta.url);

  // net request.
  for (let i = 0; i < feignClientCfg.maxAutoRetriesNextServer; i++) {

    let uri;
    let uriPathname = url;

    if (!febs.string.isEmpty(cfgurl) && __debugFeignClient) {
      uri = urlUtils.join(cfgurl, url);
    }
    else {
      let host: MicroserviceInfo;
      try {
        host = await feignClientCfg.findServiceCallback(meta.name, excludeHost);
        if (!host) {
          continue;
        }
      } catch (e) {
        lastError = e;
        getLogger().error(getErrorMessage(e));
        continue;
      }
    
      excludeHost = `${host.ip}:${host.port}`;
      uri = urlUtils.join(excludeHost, url);

      if (host.port == 443) {
        if (uri[0] == '/') uri = 'https:/' + uri;
        else uri = 'https://' + uri;
      } else {
        if (uri[0] == '/') uri = 'http:/' + uri;
        else uri = 'http://' + uri;
      }
    }

    request = {
      method: requestMapping.method.toString(),
      mode: requestMapping.mode,
      headers: febs.utils.mergeMap(feignClientCfg.headers, requestMapping.headers, feignData ? feignData.headers : null),
      timeout: requestMapping.timeout,
      credentials: requestMapping.credentials,
      body: requestMapping.body,
      url: uri,
    }

    let c = await _callFeignClient();
    if (c && c.filterRequestCallback) {
      c.filterRequestCallback(request, feignData);
    }
    
    for (let j = 0; j < feignClientCfg.maxAutoRetries; j++) {

      let status: number;

      let r: any;
      let interval: number = Date.now();
      try {

        response = null;
        responseMsg = null;
        lastError = null;

        let ret = await feignClientCfg.fetch(uri, request);
        response = ret;

        status = ret.status;

        interval = Date.now() - interval;

        // ok.
        let contentType = ret.headers.get('content-type') || null;
        if (Array.isArray(contentType)) { contentType = contentType[0]; }
        contentType = contentType ? contentType.toLowerCase() : contentType;
        // formdata.
        if (febs.string.isEmpty(contentType) || contentType.indexOf('application/x-www-form-urlencoded') >= 0) {
          let txt = await ret.text();
          logFeignClient(request, febs.utils.mergeMap(response, { body: txt }), interval);

          r = qs.parse(txt)
        }
        // json.
        else if (contentType.indexOf('application/json') >= 0) {
          r = await ret.json();
          logFeignClient(request, febs.utils.mergeMap(response, { body: r }), interval);
        }
        // stream.
        else {
          r = await ret.blob();
          logFeignClient(request, febs.utils.mergeMap(response, { body: r }), interval);
        }
        responseMsg = r;
      } catch (e) {
        logFeignClient(request, {err:e} as any, 0);
        lastError = e;
        getLogger().error(getErrorMessage(e));
        continue;
      }

      // 返回对象.
      try {
        if (status && (status < 200 || status >= 300)) {
          throw new Error("HttpStatusCode is " + status);
        }

        if (!r) {
          return r;
        }
        else if (!castType) {
          if (feignClientCfg.filterMessageCallback) {
            let rr = {};
            feignClientCfg.filterMessageCallback(r, rr, meta.name, uriPathname);
            return rr;
          }
          else {
            return r;
          }
        } else {
          let o = new castType();
          if (feignClientCfg.filterMessageCallback) {
            feignClientCfg.filterMessageCallback(r, o, meta.name, uriPathname);
            return o;
          }
          else {
            let datar = objectUtils.castType(r, castType, false);
            if (datar.e) {
              throw datar.e;
            }
            o = datar.data;
          }
          return o;
        }
      } catch (e) {
        if (restObject) {
          if (args.length <= restObject.parameterIndex) {
            args.length = args.length + 1;
          }
          args[restObject.parameterIndex] = {
            request,
            response,
            responseMsg: responseMsg,
            error: e,
          };
        }
        return await fallback();
      }
    } // for.
  } // for.

  if (restObject) {
    if (args.length <= restObject.parameterIndex) {
      args.length = args.length + 1;
    }
    args[restObject.parameterIndex] = {
      request,
      response,
      responseMsg: responseMsg,
      error: lastError,
    };
  }
  return await fallback();
}