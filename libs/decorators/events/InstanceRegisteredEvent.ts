'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-31 00:41
* Desc: 
*/

import { getEvents, pushEvent } from '../decoratorGlobal';

/**
* @desc 实例注册到注册中心的事件.
*/
export interface InstanceRegisteredEvent {

}

/**
 * 实例注册到注册中心的事件监听.
 * 
 * @example
 * 
 *    class Demo {
 *      ﹫InstanceRegisteredEventListener
 *      onEvent(ev: InstanceRegisteredEvent): Promise<void> {
 *      }
 *    }
 */
export function InstanceRegisteredEventListener(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  pushEvent('InstanceRegisteredEventListener', { target, propertyKey, method: descriptor.value });
}

export async  function _callInstanceRegisteredEvent(ev: InstanceRegisteredEvent) {
  let events = getEvents('InstanceRegisteredEventListener');
  for (let i in events) {
    let f = events[i].method.apply(events[i].target, [ev]);
    if (f instanceof Promise) {
      await f;
    }
  }
}