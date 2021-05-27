'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-18 11:05
* Desc: 
*/

/**
* @desc: 连接url地址.
*/
export function getLazyParameterValue(arg: any): any {
  if (typeof arg === 'function') {
    return arg();
  }
  else {
    return arg;
  }
}