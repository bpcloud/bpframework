'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-09 17:30
* Desc: 
*/

export function getEnableScheduled(): boolean {
  return !!(global as any).__enableScheduled;
}
