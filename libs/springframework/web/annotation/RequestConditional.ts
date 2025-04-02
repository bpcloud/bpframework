'use strict';

/**
* Copyright (c) 2025 SPACECORE Co.,Ltd. All Rights Reserved.
* Author: brian.li
* Date: 2025-04-02 19:48
* Desc: 
*/

import 'reflect-metadata'
import * as febs from 'febs';
import { RestObjectType, RestObjectTypeFeign } from './RestObject';

export const _RequestConditionalMetadataKey = Symbol('_RequestConditionalMetadataKey')

type MatchFunction = (restObjec: RestObjectType<any> | RestObjectTypeFeign<any>) => Promise<boolean>;

export interface _RequestConditionalType {
  match: MatchFunction;
}


export function getRequestConditional(target: Object, propertyKey: string | symbol): _RequestConditionalType[] {
  return Reflect.getOwnMetadata(_RequestConditionalMetadataKey, target, propertyKey) || [];
}

/**
 * @desc 当match函数返回false时，不继续执行请求.
 * 
 * @returns {MethodDecorator}
 */
export function RequestConditional(match:MatchFunction): MethodDecorator {
  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {

    let routers: _RequestConditionalType[] = Reflect.getOwnMetadata(_RequestConditionalMetadataKey, target.constructor, propertyKey) || [];
    routers.push({ match });

    Reflect.defineMetadata(
      _RequestConditionalMetadataKey,
      routers,
      target.constructor,
      propertyKey
    );
  }
}
