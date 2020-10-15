'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-04 15:48
* Desc: 
*/


import * as febs from 'febs';
import { getEvents, pushEvent } from "../decoratorGlobal";
import { ServiceInfo } from '../../../types/Application';

/**
 * 定义服务发现处理方法; 使用此方法替换系统内部默认的方法.
 * 
 * @example
 *    ﹫Service
 *    class Configure {
 *      ﹫FindMicroserviceConfigure
 *      onFindMicroservice(serviceName: string, excludeHost: string): Promise<ServiceInfo> {
 *      }
 *    }
 * @param cfg cron,fixedDelay,fixedRate必须且仅使用一种.
 */
export function FindMicroserviceConfigure(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  pushEvent('FindMicroserviceConfigure', {target, propertyKey, method: descriptor.value}, true);
}

export async function _callFindMicroservice(
    serviceName: string,
    excludeHost: string
  ): Promise<ServiceInfo> {
  
  let events = getEvents('FindMicroserviceConfigure');
  for (let i in events) {
    let f = events[i].method.apply(events[i].target, [serviceName, excludeHost]);
    if (f instanceof Promise) {
      f = await f;
    }
    return f;
  }
}