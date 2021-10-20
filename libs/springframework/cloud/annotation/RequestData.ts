'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-22 18:15
* Desc: 
*/

import 'reflect-metadata'
import * as febs from 'febs';
import { _RequestMappingPushParams } from '../../web/annotation/RequestMapping';
import { FeignDataType } from '../../../../types';
const _FeignDataMetadataKey = Symbol('_FeignDataMetadataKey');

type _FeignDataMetadataType = { parameterIndex: number };

/**
 * @desc 用于传递参数, 可以在 `FeignClientConfigure` 中使用
 * @returns {ParameterDecorator}
 */
export function FeignData(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  if (Reflect.hasOwnMetadata(_FeignDataMetadataKey, target, propertyKey)) {
    throw new Error(
      '@FeignData must only one');
  }

  Reflect.defineMetadata(_FeignDataMetadataKey, {
    parameterIndex,
  }, target, propertyKey);

  _RequestMappingPushParams(target, propertyKey, {
    parameterIndex,
    type: 'rd',
    castType: null,
  });
}

export function _FeignDataDo(target: Object, propertyKey: string | symbol, args:IArguments): FeignDataType {
  let parameter: _FeignDataMetadataType = Reflect.getOwnMetadata(_FeignDataMetadataKey, target, propertyKey);
  if (!parameter) {
    return null;
  }

  let argVal = args[parameter.parameterIndex];
  if (parameter.parameterIndex >= args.length || febs.utils.isNull(argVal)) {
    return null;
  }

  return argVal;
}