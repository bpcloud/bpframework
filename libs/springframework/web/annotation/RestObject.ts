'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-22 18:15
* Desc: 
*/

import 'reflect-metadata'
import * as febs from 'febs';
import * as Fetch from 'febs/types/fetch';
import * as Rest from '@/types/springframework/rest_request';
import { _RequestMappingPushParams } from './RequestMapping';

const _RestObjectMetadataKey = Symbol('_RestObjectMetadataKey');

type _RestObjectMetadataType = { parameterIndex: number };


/**
 * @desc RestObject参数类型.
 */
export type RestObjectType<T = any> = {
  /** request对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  request: Fetch.Request|Rest.RestRequest;
  /** response对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  response: Fetch.Response|Rest.RestResponse;
  /** 已经从response对象中读取的消息 */
  responseMsg: any;
  /** 处理过程中发生的错误 */
  error: Error;
  /** web 上下文对象; 如koa.Context等 */
  ctx: T;
};

/**
 * @desc RestObject参数类型. 用于FeignClient.
 */
export type RestObjectTypeFeign<T = any> = {
  /** request对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  request: Fetch.Request;
  /** response对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  response: Fetch.Response;
  /** 已经从response对象中读取的消息 */
  responseMsg: any;
  /** 处理过程中发生的错误 */
  error: Error;
  /** web 上下文对象; 如koa.Context等 */
  ctx: T;
};

/**
 * @desc RestObject参数类型. 用于FeignClient.
 */
export type RestObjectTypeRest<T = any> = {
  /** request对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  request: Rest.RestRequest;
  /** response对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  response: Rest.RestResponse;
  /** 已经从response对象中读取的消息 */
  responseMsg: any;
  /** 处理过程中发生的错误 */
  error: Error;
  /** web 上下文对象; 如koa.Context等 */
  ctx: T;
};


/**
 * @desc 用于映射请求中的Rest对象, 可以对Request,Response等内容做特殊处理.
 * 
 * @returns {ParameterDecorator}
 */
export function RestObject(target: Object, propertyKey: string | symbol, parameterIndex: number): void;
export function RestObject(): ParameterDecorator;
export function RestObject(...args: any[]) {
  if (args.length == 3) {
    let target = args[0];
    let propertyKey = args[1];
    let parameterIndex = args[2];
    if (Reflect.hasOwnMetadata(_RestObjectMetadataKey, target, propertyKey)) {
      throw new Error(
        '@RestObject must only one',
      );
    }

    Reflect.defineMetadata(_RestObjectMetadataKey, {
      parameterIndex,
    }, target, propertyKey);

    _RequestMappingPushParams(target, propertyKey, {
      parameterIndex,
      type: 'ro',
      castType: undefined,
    });

  } else {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number): void => {
      if (Reflect.hasOwnMetadata(_RestObjectMetadataKey, target, propertyKey)) {
        throw new Error(
          '@RestObject must only one',
        );
      }

      Reflect.defineMetadata(_RestObjectMetadataKey, {
        parameterIndex,
      }, target, propertyKey);

      _RequestMappingPushParams(target, propertyKey, {
        parameterIndex,
        type: 'ro',
        castType: undefined,
      });
    }
  }
}

export function _RestObjectDo(target: Object, propertyKey: string | symbol, args: IArguments): _RestObjectMetadataType {
  let parameter: _RestObjectMetadataType = Reflect.getOwnMetadata(_RestObjectMetadataKey, target, propertyKey);
  if (!parameter) {
    return null;
  }

  return {
    parameterIndex: parameter.parameterIndex,
  }
}
