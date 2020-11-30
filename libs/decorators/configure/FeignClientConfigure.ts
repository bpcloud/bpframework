'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-04 15:48
* Desc: 
*/


import { getEvents, pushEvent } from "../decoratorGlobal";
import { FeignClientConfigureInfo } from '../../../types';

/**
 * 定义feignClient相关配置.
 * 
 * @example
 *    ﹫Service
 *    class Configure {
 *      ﹫FeignClientConfigure
 *      onFeignClient(): bp.FeignClientConfigureInfo {
 *      }
 *    }
 */
export function FeignClientConfigure(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  pushEvent('FeignClientConfigure', {target, propertyKey, method: descriptor.value}, true);
}

export async function _callFeignClient(
  ): Promise<FeignClientConfigureInfo> {

  let events = getEvents('FeignClientConfigure');
  for (let i in events) {
    let f = events[i].method.apply(events[i].target);
    if (f instanceof Promise) {
      f = await f;
    }
    return f;
  }
}