'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-22 18:15
* Desc: 
*/

import 'reflect-metadata'
import * as febs from 'febs';

export const _IgnoreRestLoggerMetadataKey = Symbol('_IgnoreRestLoggerMetadataKey')

/**
 * @desc 用于定义请求.
 * 
 * @returns {MethodDecorator}
 */
export function IgnoreRestLogger(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  Reflect.defineMetadata(
    _IgnoreRestLoggerMetadataKey,
    true,
    target, 
    propertyKey
  )
}
