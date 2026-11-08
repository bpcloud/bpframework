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
* @desc: 解析 ${name} 或 ${name:default} 表达式.
*   - 仅按第一个冒号切分, 默认值中允许包含冒号;
*   - 空默认值保留为空字符串, 不会被转成数字 0;
*   - 默认值 'true'/'false' 转为布尔值, 纯数字字符串转为数字.
*/
function resolveValueExpression(vv: string, configs: any): any {
  let colonIndex = vv.indexOf(':');
  let name = colonIndex < 0 ? vv : vv.substring(0, colonIndex);

  if (configs && configs.hasOwnProperty(name)) {
    return configs[name];
  }

  // 配置中不存在该项, 使用默认值.
  if (colonIndex < 0) {
    return undefined;
  }

  let defaultValue: any = vv.substring(colonIndex + 1);
  if (defaultValue === '') {
    return '';
  }
  if (defaultValue === 'true') {
    return true;
  }
  if (defaultValue === 'false') {
    return false;
  }
  if (typeof defaultValue === 'string' && defaultValue.trim() !== '' && !isNaN(defaultValue as any)) {
    return Number(defaultValue);
  }
  return defaultValue;
}


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
    // @Value("${teacherName3:defaultName}")
    let vv = key.substring(2, key.length - 1);
    instances[key] = resolveValueExpression(vv, configs);
    return instances[key];
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
      instances[key] = resolveValueExpression(vv, configs);

      target[propertyKey] = instances[key];
    }
  }
}