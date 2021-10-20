'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-22 18:15
* Desc: 
*/

import 'reflect-metadata'
import * as febs from 'febs';
import { _PathVariableDo } from './PathVariable';
import { _FeignClientDo, _FeignClientMetadataKey, getFeignClientDefaultCfg } from '../../cloud/FeignClient';
import { _RequestBodyDo } from './RequestBody';
import { _RequestParamDo } from './RequestParam';
import { _RestObjectDo } from './RestObject';
import { _RestControllerDo, _RestControllerMetadataKey, _RestControllerPushRouter } from './RestController';
import { _FeignDataDo } from '../../cloud/annotation/RequestData';

const _RequestMappingParamsMetadataKey = Symbol('_RequestMappingParamsMetadataKey')

/**
 * request method.
 */
export enum RequestMethod {
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

/**
 * @desc 用于定义post请求.
 * 
 * @returns {MethodDecorator}
 */
export function PostMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 附加的header */
  headers?: { [key: string]: string|string[] } | (()=>{ [key: string]: string|string[] }),
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}) {
  return RequestMapping(febs.utils.mergeMap(cfg, { method: RequestMethod.POST }));
}

/**
 * @desc 用于定义put请求.
 * 
 * @returns {MethodDecorator}
 */
export function PutMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?的qs */
  path: string | string[],
  /** 附加的header */
  headers?: { [key: string]: string|string[] } | (()=>{ [key: string]: string|string[] }),
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}) {
  return RequestMapping(febs.utils.mergeMap(cfg, { method: RequestMethod.PUT }));
}

/**
 * @desc 用于定义patch请求.
 * 
 * @returns {MethodDecorator}
 */
export function PatchMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 附加的header */
  headers?: { [key: string]: string|string[] } | (()=>{ [key: string]: string|string[] }),
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}) {
  return RequestMapping(febs.utils.mergeMap(cfg, { method: RequestMethod.PATCH }));
}

/**
 * @desc 用于定义get请求.
 * 
 * @returns {MethodDecorator}
 */
export function GetMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 附加的header */
  headers?: { [key: string]: string|string[] } | (()=>{ [key: string]: string|string[] }),
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}) {
  return RequestMapping(febs.utils.mergeMap(cfg, { method: RequestMethod.GET }));
}

/**
 * @desc 用于定义delete请求.
 * 
 * @returns {MethodDecorator}
 */
export function DeleteMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 附加的header */
  headers?: { [key: string]: string|string[] } | (()=>{ [key: string]: string|string[] }),
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}) {
  return RequestMapping(febs.utils.mergeMap(cfg, { method: RequestMethod.DELETE }));
}

/**
 * @desc 用于定义请求.
 * 
 * @returns {MethodDecorator}
 */
export function RequestMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 默认为 GET */
  method?: RequestMethod,
  /** 附加的header */
  headers?: { [key: string]: string|string[] } | (()=>{ [key: string]: string|string[] }),
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include' | null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}): MethodDecorator {

  let cpath = Array.isArray(cfg.path) ? cfg.path : [cfg.path];
  for (let i = 0; i < cpath.length; i++) {
    if (febs.string.isEmpty(cpath[i])) {
      throw new Error(
        '@RequestMapping need \'path\' parameter'
      );
    }
  }

  if (cfg.path.length == 0) {
    throw new Error(
      '@RequestMapping need \'path\' parameter'
    )
  }

  cfg.method = cfg.method || RequestMethod.GET;

  let pathVariables = getPathVariables(cpath);
  
  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {

    _RestControllerPushRouter(target, target.constructor, {
      path: cfg.path,
      functionPropertyKey: propertyKey,
      params: _GetRequestMappingParams(target, propertyKey),
      method: cfg.method,
    });

    let method = descriptor.value;
    descriptor.value = function () {

      // RestController.
      let isRestControllerClass: boolean = !!Reflect.hasOwnMetadata(_RestControllerMetadataKey, target.constructor);
      if (isRestControllerClass) {
        let cfgp: {
          pathname: string,
          querystring: any,
          request: any,
          response: any,
          params: {
            name?: string;
            required?: boolean;
            parameterIndex?: number;
            defaultValue?: any;
            type: "pv" | "rb" | "rp" | "ro";
            castType: any,
          }[],
          pathVars?: { [name: string]: number },
        } = arguments[0];
        let matchInfo: { match: boolean, requestError: Error, responseError: Error } = arguments[1];
        let ctx: any = arguments[2];
        let ret: boolean;
        try {
          ret = _RestControllerDo(target, ctx, matchInfo, cfg.headers, cfg.feignCastType, arguments, cfgp.pathname, cfgp.querystring, cfgp.request, cfgp.response, cfgp.params, cfgp.pathVars);
        } catch (err) {
          if (matchInfo) {
            matchInfo.requestError = err;
          }
        }

        if (ret) {
          try {
            return method.apply(this, arguments);
          } catch (e) {
            if (matchInfo) {
              matchInfo.responseError = e;
            }
            return;
          }
        }
        else {
          if (matchInfo) {
            matchInfo.match = false;
          }
          return;
        }
      }

      // FeignClient.
      let isFeignClientClass: boolean = !!Reflect.hasOwnMetadata(_FeignClientMetadataKey, target.constructor);

      //
      // PathVariable
      //
      if (!_PathVariableDo(target, propertyKey, arguments, pathVariables)) {
        return;
      }

      let urlPaths = setPathVariables(cpath, pathVariables);
      let requestDefaultCfg = getFeignClientDefaultCfg();

      let headers;
      if (cfg.headers && typeof cfg.headers === 'function') {
        headers = cfg.headers();
      } else {
        headers = cfg.headers;
      }
      const defaultHeaders = febs.utils.mergeMap(requestDefaultCfg.headers, headers);

      let requestMappingParam = {
        path: urlPaths,
        method: cfg.method,
        mode: cfg.mode || requestDefaultCfg.mode,
        headers: defaultHeaders,
        timeout: cfg.timeout || requestDefaultCfg.timeout,
        credentials: cfg.hasOwnProperty('credentials')? cfg.credentials: requestDefaultCfg.credentials,
        body: null as string,
      };

      //
      // RequestBody
      //
      _RequestBodyDo(target, propertyKey, arguments, requestMappingParam);

      //
      // RequestParam
      //
      _RequestParamDo(target, propertyKey, arguments, requestMappingParam);

      //
      // RestObject.
      //
      let restObject = _RestObjectDo(target, propertyKey, arguments);

      //
      // feignClient.
      //
      if (isFeignClientClass) {
        let feignData = _FeignDataDo(target, propertyKey, arguments);
        return _FeignClientDo(target, requestMappingParam, feignData, restObject, cfg.feignCastType, arguments, () => method.apply(this, arguments));
      } else {
        return method.apply(this, arguments);
      }
    }
  }
}

/**
 * 在参数路径中寻找所有 {xxx} 形式的参数; 如果重复, 则抛出异常
 * @param urlPaths 
 */
function getPathVariables(urlPaths: string[]): { [key: string]: string } {
  let vars: { [key: string]: string } = {};

  for (let i in urlPaths) {
    let url = urlPaths[i]
    let urls = url.split('/');
    for (let j in urls) {
      url = urls[j];
      if (/^\{[a-zA-Z\$_][a-zA-Z\d_]*\}$/.test(url)) {
        url = url.substr(1, url.length - 2);
        if (vars.hasOwnProperty(url)) {
          throw new Error(
            '@RequestMapping path variables is conflicted: ' + urlPaths.toString()
          );
        }
        else {
          vars[url] = '';
        }
      } // if.
    } // for.
  } // for.

  return vars;
}


/**
 * 使用pathVariables构建正确的path.
 * @param urlPaths 
 */
function setPathVariables(urlPaths: string[], pathVariables:{ [key: string]: string }): string[] {
  for (let vari in pathVariables) {
    for (let i in urlPaths) {
      let url = urlPaths[i];
      let urls = url.split('/');
      let match: boolean = false;
      for (let j in urls) {
        if (urls[j] == '{' + vari + '}') {
          urls[j] = pathVariables[vari];
          match = true;
          break;
        }
      }
      if (match) {
        url = '';
        for (let j in urls) {
          if (url.length > 0) {
            url += '/';
          }
          url += urls[j];
        }
        urlPaths[i] = url;
        break;
      }
    }
  }
  return urlPaths;
}


/**
 * @desc 将参数信息存储到target.
 */
export function _GetRequestMappingParams(target: Object, propertyKey: string | symbol): {
    name?: string,
    required?: boolean,
    parameterIndex?: number,
    defaultValue?: any,
    type: 'pv' | 'rb' | 'rp' | 'ro'
}[]
{
  return Reflect.getOwnMetadata(_RequestMappingParamsMetadataKey, target, propertyKey);
}


/**
 * @desc 将参数信息存储到target.
 */
export function _RequestMappingPushParams(target: Object, propertyKey: string | symbol, cfg: {
  name?: string,
  required?: boolean,
  parameterIndex?: number,
  castType: any,
  defaultValue?: any,
  type: 'pv'|'rb'|'rp'|'ro'|'rd'
}): void {

  let routers: {
    name?: string,
    required?: boolean,
    parameterIndex?: number,
    castType: any,
    defaultValue?: any,
    type: 'pv' | 'rb' | 'rp' | 'ro' | 'rd'
  }[] = Reflect.getOwnMetadata(_RequestMappingParamsMetadataKey, target, propertyKey) || [];

  routers.push(cfg);

  Reflect.defineMetadata(
    _RequestMappingParamsMetadataKey,
    routers,
    target, 
    propertyKey
  )
}