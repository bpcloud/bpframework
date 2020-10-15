'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-31 00:41
* Desc: 
*/

import { getEvents, pushEvent } from '../decoratorGlobal';
import { ImmutableConfigMap } from '../../../types/struct.d';

/**
* @desc 应用配置加载完成事件.
*/
export interface ContextRefreshedEvent {
  /**
   * 所有配置
   */
  configs: ImmutableConfigMap;
}

/**
 * 本地配置加载完成, 系统service对象初始化完成的事件监听.
 * 
 * @example
 * 
 *    class Demo {
 *      ﹫ContextRefreshedEventListener
 *      onContextRefreshed(ev: ContextRefreshedEvent): Promise<void> {
 *      }
 *    }
 */
export function ContextRefreshedEventListener(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  pushEvent('ContextRefreshedEventListener', { target, propertyKey, method: descriptor.value });
}

export async  function _callContextRefreshedEvent(ev: ContextRefreshedEvent) {
  let events = getEvents('ContextRefreshedEventListener');
  for (let i in events) {
    let f = events[i].method.apply(events[i].target, [ev]);
    if (f instanceof Promise) {
      await f;
    }
  }
}