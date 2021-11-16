'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-22 18:15
* Desc: 
*/

import 'reflect-metadata'
import * as febs from 'febs';
import { _RequestMappingPushParams } from './RequestMapping';
// import * as queryString from 'querystring';
var queryString = require('../../../utils/qs/dist');

const _RequestParamMetadataKey = Symbol('_RequestParamMetadataKey');

type _RequestParamMetadataType = { name: string, required: boolean, defaultValue:any, castType:any, parameterIndex: number };

/**
 * @desc 用于映射请求中的查询参数.
 * 
 * 
 * @example
 * 
 *       // url: /contacts?contactname=xxx 
 * 
 *       ﹫RequestMapping({path: "/contacts"}) 
 *       foo(﹫RequestParam("contactname") contactname: string) { 
 *           ... 
 *       } 
 * @returns {ParameterDecorator}
 */
export function RequestParam(cfg: {
  /** 参数名 */
  name: string,
  /** 是否是必须存在的参数 */
  required?: boolean,
  /** 指定数据类型,将会对值做类型转换 */
  castType?: any,
  /** 如果参数不存在时的默认值 */
  defaultValue?: any,
}): ParameterDecorator {
  
  if (febs.string.isEmpty(cfg.name)) {
    throw new Error(
      '@RequestParam need \'name\' parameter'
    )
  }

  cfg.required = febs.utils.isNull(cfg.required) ? true : cfg.required;
  
  return (target: Object, propertyKey: string | symbol, parameterIndex: number):void => {
    let existingParameters: _RequestParamMetadataType[] = Reflect.getOwnMetadata(_RequestParamMetadataKey, target, propertyKey) || [];
    existingParameters.push({
      name: cfg.name,
      required: cfg.required,
      defaultValue: cfg.defaultValue,
      castType: cfg.castType,
      parameterIndex,
    });
    Reflect.defineMetadata(_RequestParamMetadataKey, existingParameters, target, propertyKey);

    _RequestMappingPushParams(target, propertyKey, {
      name: cfg.name,
      required: cfg.required,
      defaultValue: cfg.defaultValue,
      castType: cfg.castType,
      parameterIndex,
      type: 'rp'
    });
  }
}

export function _RequestParamDo(target: Object, propertyKey: string | symbol, args:IArguments, requestMapping:any): void {
  let parameters: _RequestParamMetadataType[] = Reflect.getOwnMetadata(_RequestParamMetadataKey, target, propertyKey);
  if (parameters) {
    let qs = '';
    for (let parameter of parameters) {
      let val: any = args[parameter.parameterIndex];
      if (parameter.required) {
        if (parameter.parameterIndex >= args.length || febs.utils.isNull(val)) {
          if (!parameter.defaultValue) {
            throw new febs.exception("@RequestParam Missing required argument.", febs.exception.PARAM, __filename, __line, __column);
          }
        }
      }
      if (febs.utils.isNull(val)) {
        val = parameter.defaultValue;
      }

      let obj = {} as any;
      obj[parameter.name] = val;
      if (qs.length > 0) {
        qs += '&';
      }
      qs += queryString.stringify(obj);
    } // for.

    // append qs
    if (qs.length > 0) {
      if (Array.isArray(requestMapping.path)) {
        if (requestMapping.path.length > 0) {
          requestMapping.qs = [];
        }
        for (const key in requestMapping.path) {
          let p = requestMapping.path[key];
          let i = p.indexOf('?');
          if (i == p.length - 1) {
            p += qs;
          } else if (i < 0) {
            p += '?' + qs;
          } else {
            p += '&' + qs;
          }
          requestMapping.qs.push(p);
        }
      }
      else {
        let p = requestMapping.path;
        let i = p.indexOf('?');
        if (i == p.length - 1) {
          p += qs;
        } else if (i < 0) {
          p += '?' + qs;
        } else {
          p += '&' + qs;
        }
        requestMapping.qs = p;
      }
    }
    if (!requestMapping.qs) {
      requestMapping.qs = requestMapping.path;
    } // if..else.
  }
  else {
    requestMapping.qs = requestMapping.path;
  } // if.
}
