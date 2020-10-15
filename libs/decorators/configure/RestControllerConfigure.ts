'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-04 15:48
* Desc: 
*/


import * as febs from 'febs';
import { getEvents, pushEvent } from "../decoratorGlobal";
import { RestControllerConfigureInfo } from '../../../types';

/**
 * 定义RestController相关配置.
 * 
 * @example
 *    ﹫Service
 *    class Configure {
 *      ﹫RestControllerConfigure
 *      onRestController(): bp.RestControllerConfigureInfo {
 *      }
 *    }
 */
export function RestControllerConfigure(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  pushEvent('RestControllerConfigure', {target, propertyKey, method: descriptor.value}, true);
}

export async function _callRestController(
  ): Promise<RestControllerConfigureInfo> {

  let events = getEvents('RestControllerConfigure');
  for (let i in events) {
    let f = events[i].method.apply(events[i].target);
    if (f instanceof Promise) {
      f = await f;
    }
    return f;
  }
}