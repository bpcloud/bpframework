'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-10-22 18:15
 * Desc:
 */

import 'reflect-metadata'

import { pushGlobalWaitAutowireds, getServiceInstances } from '../../../Service';
import { getLogger } from '../../../../logger';
import objectUtils from '../../../../utils/objectUtils';

interface ServiceNode {
  __autowiredParents: ServiceNode[];
}
function testConflictNode(child: ServiceNode, parent: ServiceNode) {
  //
  // 判断child是否再parent的祖先链中.
  if (child === parent) {
    let n1 = objectUtils.getClassNameByClass(child as any)
    let n2 = objectUtils.getClassNameByClass(parent as any)
    throw new Error(`Autowired ${n1} <-> ${n2} circular dependency`);
  }

  if (parent.__autowiredParents) {
    let arr = parent.__autowiredParents.slice(0);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === child) {
        let n1 = objectUtils.getClassNameByClass(child as any)
        let n2 = objectUtils.getClassNameByClass(parent as any)
        throw new Error(`Autowired ${n1} <-> ${n2} circular dependency`);
      }

      if (arr[i].__autowiredParents) {
        arr = arr.concat(arr[i].__autowiredParents);
      }
    }
    arr.length = 0;
    arr = null;
  }
}

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

    if (typeof type === 'function') {
      let __autowiredParents1 = (type.constructor as any).__autowiredParents = (type.constructor as any).__autowiredParents || [];
      (target.constructor as any).__autowiredParents = (target.constructor as any).__autowiredParents || [];
      testConflictNode(type as any, target as any);
      __autowiredParents1.push(target);
    }

    let ins = getServiceInstances(type);
    if (ins) {
      let className = typeof type === 'function' ? '['+objectUtils.getClassNameByClass(type)+']' : type;

      if (ins.singleton) {
        getLogger().debug(`[Autowired] singleton ` + className);
        (target as any)[propertyKey] = ins.instance;
        if (!ins.instance) {
          throw new Error(`Autowired Cannot find Bean: '${className}'`);
        }
      }
      else {
        ins.callback().then(res => {
          getLogger().debug(`[Autowired] ` + className);
          (target as any)[propertyKey] = res;
          if (!res) {
            throw new Error(`Autowired Cannot find Bean: '${className}'`);
          }
        });
      }
    }
    else {
      pushGlobalWaitAutowireds({
        target,
        propertyKey,
        type
      });
    }
  }
}