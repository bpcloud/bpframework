'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-31 09:42
* Desc: 
*/

const Decorator_event = Symbol('Decorator_event');

/**
* @desc 获得全局存储的事件.
* @return 
*/
export function getEvents(eventType:string): any[] {
  let obj = (global as any)[Decorator_event];
  if (!obj) {
    obj = {};
    (global as any)[Decorator_event] = obj;
  }

  return obj[eventType] || [];
}

/**
* @desc 将指定的事件添加到全局中保存.
*/
export function pushEvent(eventType: string, data: any, singleton?: boolean) {
  let obj = (global as any)[Decorator_event];
  if (!obj) {
    obj = {};
    (global as any)[Decorator_event] = obj;
  }

  obj[eventType] = obj[eventType] || [];

  if (singleton && obj[eventType].length > 0) {
    throw new Error(`'@${eventType}': There can only be one instance`)
  }

  obj[eventType].push(data);
}
