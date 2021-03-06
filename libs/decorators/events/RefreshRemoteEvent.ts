'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-31 00:41
* Desc: 
*/

import { getEvents, pushEvent } from '../decoratorGlobal';
import { ImmutableConfigMap } from '../../../types/struct.d';

const SYM_LISTENER = Symbol("SYM_LISTENER");

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

  /**
   * 判断是否包含指定的配置.
   * @param key e.g. spring.rabbit
   */
  isContainUpdated(key: string): boolean;
}

function isContainUpdated(key: string): boolean {
  let all = this.updatedConfigs;
  if (all) {
    for (const k in all) {
      if (k == key || k.indexOf(key + '.') == 0 || k.indexOf(key + '[') == 0) {
        return true;
      }
    }
  }
  return false;
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

export function _addRefreshRemoteEventListener(l:(ev:RefreshRemoteEvent)=>(Promise<void>|void)) {
  if (!(global as any)[SYM_LISTENER]) {
    (global as any)[SYM_LISTENER] = [l];
  } else {
    (global as any)[SYM_LISTENER].push(l);
  }
}

export async function _callRefreshRemoteEvent(ev: RefreshRemoteEvent) {

  if (ev) {
    ev.isContainUpdated = isContainUpdated.bind(ev);
  }

  let events = getEvents('RefreshRemoteEventListener');
  for (let i in events) {
    let f = events[i].method.apply(events[i].target, [ev]);
    if (f instanceof Promise) {
      await f;
    }
  }

  let listeners = (global as any)[SYM_LISTENER];
  if (listeners) {
    for (let i in listeners) {
      let f = listeners[i](ev);
      if (f instanceof Promise) {
        await f;
      }
    }
  }
}