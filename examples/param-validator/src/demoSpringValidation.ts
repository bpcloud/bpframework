'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-11-11 14:42
 * Desc:
 */

import {
  AssertFalse,
  AssertTrue,
  DecimalMax,
  DecimalMin,
  Email,
  Future,
  FutureOrPresent,
  Max,
  Min,
  Negative,
  NegativeOrZero,
  NotBlank,
  NotEmpty,
  NotNull,
  Null,
  Past,
  PastOrPresent,
  Pattern,
  Positive,
  PositiveOrZero,
  Range,
  Size,
} from '@bpframework/validation'


/**
 * @desc: 空值及字符串验证.
 */
class DemoNullValidationBean {
  /** 指定参数必须为 null 或 undefined  */
  @Null
  nullValue1: any = null;
  nullValue2: any = undefined;

  /** 指定参数不能为 null 或 undefined. */
  @NotNull
  notNullValue: any = 1;
  
  /** 指定参数必须至少包含一个非空字符串; trim操作后长度>0 */
  @NotBlank
  notBlankValue: string = ' 1 ';

  /** 指定参数不能为 null、undefined且长度大于0; (object.size() > 0 或 object.length > 0) */
  @NotEmpty
  notEmptyValue: string = '1';

  /** 指定参数(字符串,array)的长度的最大最小值; (object.size() 或 object.length) */
  @Size({min: 1, max: 100})
  sizeValue1: string = '1';
  @Size({min: 1, max: 100})
  sizeValue2: Array<any> = [1];
}

/**
* @desc: boolean值验证.
*/
class DemoBooleanValidationBean {

  /** 验证是否是 false */
  @AssertFalse
  assertFalseValue: boolean = false;

  /** 验证是否是 true */
  @AssertTrue
  assertTrueValue: boolean = true;
}

/**
* @desc: 数值判断.
*/
class DemoNumberValidationBean {
  
  /** 指定参数值必须小于等于指定的值 */
  @DecimalMax({value: 1000, message: '值超出范围'})
  decimalMaxValue: number = 1000;
  
  /** 指定参数值必须大于等于指定的值 */
  @DecimalMin({value: 1000, message: '值超出范围'})
  decimalMinValue: number = 1001;

  /** 指定整数数值类型的最大值 */
  @Max({ value: 1000, message: '值超出范围' })
  maxValue: number = 1000;
  
  /** 指定整数数值类型的最小值 */
  @Min({ value: 1000, message: '值超出范围' })
  minValue: number = 1000;

  /** 判断数值是否是负数 */
  @Negative({ message: '值不是负数' })
  negativeValue: number = -1;

  /** 判断数值是否是负数或0 */
  @NegativeOrZero({ message: '值不是负数或0' })
  negativeOrZeroValue: number = 0;

  /** 判断数值是否是正数 */
  @Positive
  positiveValue: number = 1;

  /** 判断数值是否是正数或0 */
  @PositiveOrZero
  positiveOrZeroValue: number = 0;

  /** 判断数值的范围 */
  @Range({min: 0, max: 1000})
  rangeValue: number = 500;
}


/**
* @desc: 字符串模式.
*/
class DemoStringValidationBean {

  /** 验证是否是有效email */
  @Email
  emailValue: string = 'xxx@gmail.com';

  /** 指定参数是否匹配正则 */
  @Pattern({regexp: /d*/})
  patternValue: string = '1212';
}

/**
 * @desc: 时间判断
 */
class DemoTimeValidationBean {

  /** Date参数是否是将来时间 */
  @Future
  futureValue: Date = null;

  /** Date参数是否是现在或将来时间 */
  @FutureOrPresent
  futureOrPresentValue: Date = null;

  /** Date参数是否是过去时间 */
  @Past
  pastValue: Date = null;

  /** Date参数是否是现在或过去时间	 */
  @PastOrPresent
  pastOrPresentValue: Date = null;

}


new DemoNullValidationBean();
new DemoBooleanValidationBean();
new DemoNumberValidationBean();
new DemoStringValidationBean();
new DemoTimeValidationBean();

