/**
 * Copyright (c) 2017 Copyright tj All Rights Reserved.
 * Author: lipengxiang
 * Date: 2017-06-12
 * Desc: 网络消息包格式.
 */

import * as febs from 'febs'

declare global {

  /**
  * @desc: 所有bean的基类.
  */
  interface BaseBean {
    // 任意信息.
    [index: string]: any
  }
}
