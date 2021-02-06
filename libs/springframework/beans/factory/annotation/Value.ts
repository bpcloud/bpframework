'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-10-22 18:15
 * Desc:
 */

import 'reflect-metadata'

import { registerValueInstances } from '../_instances/Value';

/**
 * @desc 表明指定的属性可以自动装载指定的值.
 * @example
 *   ﹫Service()
 *   class Demo {
 *     ﹫Value("Miss A")
 *     teacher1Name: string; // will set to 'Miss A'
 * 
 *     ﹫Value("${teacherName2}")
 *     teacher2Name: string; // will set to config value "teacherName2"
 * 
 *     ﹫Value("${teacherName3:defaultName}")
 *     teacher3Name: string; // will set to 'defaultName' if config value "teacherName3" isn't existed.
 *   }
 * 
 * @returns {PropertyDecorator}
 */

export function Value(value: any): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {

    if (typeof value !== 'string'
    || value[0] != '$' || value[1] != '{' || value[value.length - 1] != '}') {
      (target as any)[propertyKey] = value;
    }
    else {
      (target as any)[propertyKey] = registerValueInstances(target, propertyKey, value);
    }
  }
}