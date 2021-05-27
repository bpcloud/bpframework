'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-10-22 18:15
 * Desc:
 */

import 'reflect-metadata'

import { getGlobalWaitAutowireds, getServiceInstances } from '../../../Service';

/**
 * @desc 表明指定的属性可以自动装载指定的Service实例.
 * 
 * @example
 *  ﹫Autowired(ClassA)
 *  obj: ClassA;  // will to auto create object.
 * 
 * @returns {PropertyDecorator}
 */

export function Autowired(type: Function|string): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {

    let ins = getServiceInstances(type);
    if (ins) {
      if (ins.singleton) {
        (target as any)[propertyKey] = ins.instance;
        if (!ins.instance) {
          throw new Error(`Autowired Cannot find Bean: '${type}'`);
        }
      }
      else {
        ins.callback().then(res => {
          (target as any)[propertyKey] = res;
          if (!res) {
            throw new Error(`Autowired Cannot find Bean: '${type}'`);
          }
        });
      }
    }
    else {
      getGlobalWaitAutowireds().push({
        target,
        propertyKey,
        type
      });
    }
  }
}