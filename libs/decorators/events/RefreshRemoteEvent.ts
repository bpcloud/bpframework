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
* @desc 远程配置刷新事件.
*/
export interface RefreshRemoteEvent {
  /**
   * 改变的配置.
   */
  updatedConfigs: ImmutableConfigMap;
  /**
   * 最新的所有配置
   */
  latestConfigs: ImmutableConfigMap;
}

/**
 * 定义远程配置刷新的事件监听.
 * 
 * @example
 * 
 *    class Demo {
 *      ﹫RefreshRemoteEventListener
 *      onRefreshRemoteEvent(ev: RefreshRemoteEvent): Promise<void> {
 *      }
 *    }
 */
export function RefreshRemoteEventListener(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  pushEvent('RefreshRemoteEventListener', { target, propertyKey, method: descriptor.value });
}

export async function _callRefreshRemoteEvent(ev: RefreshRemoteEvent) {
  let events = getEvents('RefreshRemoteEventListener');
  for (let i in events) {
    let f = events[i].method.apply(events[i].target, [ev]);
    if (f instanceof Promise) {
      await f;
    }
  }
}