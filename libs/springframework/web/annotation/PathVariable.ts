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

const _PathVariableMetadataKey = Symbol('_PathVariableMetadataKey');

type _PathVariableMetadataType = { name: string, required: boolean, castType:any, parameterIndex: number };

/**
 * @desc 用于映射请求路径中的参数.
 * 
 * @example
 * 
 *       ﹫RequestMapping({path: "/contacts/{contactname}"}) 
 *       foo(﹫PathVariable("contactname") contactname: string) { 
 *           ... 
 *       }  
 * @returns {ParameterDecorator}
 */
export function PathVariable(cfg: {
  /** 参数名 */
  name: string,
  /** 是否是必须存在的参数 */
  required?: boolean,
  /** 指定数据类型,将会对值做类型转换 */
  castType?: any,
}): ParameterDecorator {
  if (febs.string.isEmpty(cfg.name)) {
    throw new Error(
      '@RequestParam need \'name\' parameter'
    )
  }

  cfg.required = febs.utils.isNull(cfg.required) ? true : cfg.required;
  
  return (target: Object, propertyKey: string | symbol, parameterIndex: number):void => {
    let existingParameters: _PathVariableMetadataType[] = Reflect.getOwnMetadata(_PathVariableMetadataKey, target, propertyKey) || [];
    existingParameters.push({
      name: cfg.name,
      required: cfg.required,
      parameterIndex,
      castType: cfg.castType
    });
    Reflect.defineMetadata(_PathVariableMetadataKey, existingParameters, target, propertyKey);

    _RequestMappingPushParams(target, propertyKey, {
      name: cfg.name,
      required: cfg.required,
      parameterIndex,
      type: 'pv',
      castType: cfg.castType
    });
  }
}

export function _PathVariableDo(target: Object, propertyKey: string | symbol, args:IArguments, pathVariables:{ [key: string]: string }): boolean {
  let parameters: _PathVariableMetadataType[] = Reflect.getOwnMetadata(_PathVariableMetadataKey, target, propertyKey);
  if (parameters) {
    for (let parameter of parameters) {
      if (parameter.required) {
        if (parameter.parameterIndex >= args.length || febs.utils.isNull(args[parameter.parameterIndex])) {
          throw new Error("@PathVariable Missing required argument.");
        }
      }

      if (!pathVariables.hasOwnProperty(parameter.name)) {
        throw new febs.exception(
          `@PathVariable parameter '${parameter.name}' cannot be finded`,
          febs.exception.PARAM,
          __filename,
          __line,
          __column
        );
      }

      pathVariables[parameter.name] = args[parameter.parameterIndex];
    } // for.
  } // if.

  return true;
}