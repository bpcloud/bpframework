'use strict';

/**
* Copyright (c) 2021 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2021-05-26 15:33
* Desc: 
*/

import { registerRefreshScopeBean } from '../../Service';

/**
 * 配置变更时进行刷新
 */
export function RefreshScope(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  registerRefreshScopeBean(target, propertyKey, descriptor);
}