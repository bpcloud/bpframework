'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-11-11 14:42
 * Desc:
 */

import {
  Negative,
  Size,
} from 'bpframework'


/**
 * @desc: 列表验证.
 */
class DemoListValidationBean {
  
  /** 所有SpringValidation支持的验证注解, 都支持 '.List' 验证数组元素方式. */
  @Negative.List({ listMaxLength: 5, message: '值不是负数' })
  negativeListValue: number[] = [-1, -2];
}

/**
 * @desc: 组合验证.
 */
class DemoMergeValidationBean {
  
  /** 验证注解可以组合 */

  @Size({max: 5})
  @Negative.List({ message: '值不是负数' })
  negativeListValue: number[] = [-1, -2];
}

new DemoListValidationBean();
new DemoMergeValidationBean();

