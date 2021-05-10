
'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2018-11-26 12:49
* Desc: 使用redis作为缓存.
*/

import * as febs from 'febs';

export * from './cache';
export * from './transaction';

/**
* @desc: 创建一个cache使用的key.
* @return: string.
*/
export function cacheKey(tablename:string, id:ID|any):string {
  let ids:string;
  if (typeof id === 'string') {
    ids = id;
  } else if (typeof id === 'number') {
    ids = id.toString();
  } else if (id instanceof febs.BigNumber) {
    ids = id.toFixed();
  } else {
    ids = '';
    for (const key in id) {
      const element = id[key];
      ids += element + '/';
    }
  }
  
  return tablename + '_' + ids;
}
