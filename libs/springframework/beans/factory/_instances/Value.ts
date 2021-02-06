'use strict';

/**
* Copyright (c) 2021 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2021-02-05 21:40
* Desc: 
*/


import 'reflect-metadata'

import {
  getCloudConfig,
} from '../../../../config';

const ValueInstance = Symbol('ValueInstance')
const ValueConfigInstance = Symbol('ValueConfigInstance')


/**
* @desc 获得指定参数的Value.
*/
export function registerValueInstances(target: Object, propertyKey: string | symbol, key: string): any {
  
  {
    let instancesObj = (global as any)[ValueInstance];
    if (!instancesObj) {
      instancesObj = [];
      (global as any)[ValueInstance] = instancesObj;
    }
    instancesObj.push({ target, propertyKey, key });
  }
  
  let instances = (global as any)[ValueConfigInstance];
  if (!instances) {
    instances = {};
    (global as any)[ValueConfigInstance] = instances;
  }

  let configs = getCloudConfig();
  if (!configs) {
    return null;
  }

  if (instances.hasOwnProperty(key)) {
    return instances[key];
  }
  else {
    let vv = key.substring(2, key.length - 1);
    let vv2 = vv.split(":");
    if (!configs.hasOwnProperty(vv2[0])) {
      let v:any = vv2[1];
      if (!isNaN(v) && typeof v === 'string') {
        v = Number(v);
      }
      instances[key] = v;
      return v;
    }
    else {
      instances[key] = configs[vv2[0]];
      return instances[key];
    }
  }
}

/**
* @desc: 完成装配.
*/
export function finishAutowired_values() {

  let autos:{
      target: any,
      propertyKey:string,
      key: string
  }[] = (global as any)[ValueInstance] || [];
  
  let configs = getCloudConfig();

  let instances:any = {};
  (global as any)[ValueConfigInstance] = instances;

  for (const i in autos) {
    const element = autos[i];
    const {
      target,
      propertyKey,
      key
    } = element;

    if (instances.hasOwnProperty(key)) {
      target[propertyKey] = instances[key];
    }
    else {
      let vv = key.substring(2, key.length - 1);
      let vv2 = vv.split(":");
      if (!configs.hasOwnProperty(vv2[0])) {
        let v: any = vv2[1];
        if (!isNaN(v) && typeof v === 'string') {
          v = Number(v);
        }
        instances[key] = v;
      }
      else {
        instances[key] = configs[vv2[0]];
      }

      target[propertyKey] = instances[key];
    }
  }
}