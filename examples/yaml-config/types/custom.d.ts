/**
 * Copyright (c) 2017 Copyright tj All Rights Reserved.
 * Author: lipengxiang
 * Date: 2017-06-12
 * Desc: 自定义类型
 */

import * as febs from 'febs'

declare global {
  /**
   * @desc: 定义ID别名.
   */
  type ID = string;

  /**
   * @desc: BigNumber.
   */
  type BigNumber = number | string | febs.BigNumber

  /**
   * @desc: 货币别名.
   */
  type Currency = BigNumber;
}
