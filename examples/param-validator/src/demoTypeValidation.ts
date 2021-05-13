'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-11-11 14:42
 * Desc: 同样, 下述验证修饰器也支持 '.List' 验证数组参数.
 */

import { Enum, Type } from 'bpframework'

enum DemoEnum {
  a = 1,
  b = 'b',
}

/**
 * @desc: 类型验证.
 */
class DemoTypeValidationBean {
  
  /** 验证是否是指定值 */
  @Enum({ allows: [1, 2, 3] })
  enumValue1: any = 1;

  /** 验证是否是指定枚举 */
  @Type.Enum({ enumType: DemoEnum })
  enumValue2: any = DemoEnum.a;

  /** 判断是否是true,false,'true', 'false', 0, 1 之一; 并且都会转换为布尔值 */
  @Type.Boolean
  booleanValue1: any = 1;
  @Type.Boolean
  booleanValue2: any = 'true';
  @Type.Boolean
  booleanValue3: any = false;

  /** 判断是否是Number 或可以转换为Number的字符串; 并且转换为number */
  @Type.Number
  numberValue1: any = 1;
  @Type.Number
  numberValue2: any = '1.123';

  /** 判断是否是integer或可以转换为integer的字符串; 并且转换为number */
  @Type.Integer
  integerValue1: any = 1;
  @Type.Number
  integerValue2: any = '2';

  /** 判断是否是integer, Bigint或可以转换为Bigint的字符串; 验证后保留原样 */
  @Type.BigInt
  bigintValue: any = '212121212121212121212';

  /** 判断是否是字符串; 验证后保留原样 */
  @Type.String
  stringValue: string = '212121212121212121212';

  /** 判断是否是Date或形如 '2009-06-15T08:00:00.000Z' 的ISO时间字符串; 验证后将转换为Date对象 */
  @Type.Date
  dateValue: any = '2009-06-15T08:00:00.000Z';

  /** 判断是否是object; 验证后保留原样 */
  @Type.Object
  objectValue: any = {};

  /** 判断是否是array; 验证后保留原样 */
  @Type.Array
  arrayValue1: any[] = [];

  /** 判断是否是array并对每个元素单独验证; 验证后保留原样 */
  @Type.Array({
    checkCB(elem: any, index?: number, allElem?: any[]): boolean {
      if (elem > 10) return false;
    }
  })
  arrayValue2: any[] = [1, 2, 3];

  /** 自定义方式验证 */
  @Type.Validator({
    checkCB(value: any): boolean {
      if (value == 1) return false;
    }
  })
  validatorValue: any = 2;
}

let o = new DemoTypeValidationBean();
console.log(o.booleanValue1); // true
console.log(o.booleanValue2); // true

