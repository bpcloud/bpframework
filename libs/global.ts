'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-09 17:30
* Desc: 
*/

const enableScheduled = Symbol('enableScheduled');

export function getEnableScheduled(): boolean {
  return !!(global as any)[enableScheduled];
}

export function setEnableScheduled(v:boolean): void {
  (global as any)[enableScheduled] = v;
}