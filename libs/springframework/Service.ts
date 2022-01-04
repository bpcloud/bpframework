'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-10-22 18:15
 * Desc:
 */

import 'reflect-metadata'
import * as febs from 'febs';
import { getLogger } from '../logger';
import objectUtils from '../utils/objectUtils';

const FinishAllBeanDelay = Symbol('FinishAllBeanDelay');

const ServiceWaitAutowiredInstance = Symbol('ServiceWaitAutowiredInstance')
const BeanWaitAutowiredInstance = Symbol('BeanWaitAutowiredInstance')
const BeanRefreshScopeAutowiredInstance = Symbol('BeanRefreshScopeAutowiredInstance')
const ServiceInstance = Symbol('ServiceInstance')
const AutowiredInstances = Symbol('AutowiredInstances')
const AutowiredInstancesName = Symbol('AutowiredInstancesName')
const AutowiredRefreshScopeInstances = Symbol('AutowiredRefreshScopeInstances')

function getGlobalRefreshScopeAutowiredBeans(): {key: any, callback: () => Promise<any>, singleton: boolean,}[] {
  let instances = (global as any)[BeanRefreshScopeAutowiredInstance];
  if (!instances) {
    instances = [];
    (global as any)[BeanRefreshScopeAutowiredInstance] = instances;
  }
  return instances;
}

function getGlobalWaitAutowiredServices(): {key: any, target: Object, singleton: boolean,}[] {
  let instances = (global as any)[ServiceWaitAutowiredInstance];
  if (!instances) {
    instances = [];
    (global as any)[ServiceWaitAutowiredInstance] = instances;
  }
  return instances;
}
function getGlobalWaitAutowiredBeans(): { key: any, refreshScope?:boolean, target: Object, propertyKey: string | symbol, callback: () => Promise<any>, singleton: boolean, }[] {
  let instances = (global as any)[BeanWaitAutowiredInstance];
  if (!instances) {
    instances = [];
    (global as any)[BeanWaitAutowiredInstance] = instances;
  }
  return instances;
}

function getGlobalServices(): any {
  let instances = (global as any)[ServiceInstance];
  if (!instances) {
    instances = {};
    (global as any)[ServiceInstance] = instances;
  }
  return instances;
}

function getGlobalWaitAutowireds():{
      target: any,
      propertyKey:string|symbol,
      type: Function|string
}[] {
  return (global as any)[AutowiredInstances] = (global as any)[AutowiredInstances] || [];
}

export function pushGlobalWaitAutowireds(cfg:{
      target: any,
      propertyKey:string|symbol,
      type: Function|string
}): void {
  getGlobalWaitAutowireds().push(cfg);
}


export function getGlobalWaitAutowireds_refreshScope():{
      target: any,
      propertyKey:string|symbol,
      type: Function|string
}[] {
  return (global as any)[AutowiredRefreshScopeInstances] = (global as any)[AutowiredRefreshScopeInstances] || [];
}

/**
* @desc 获得指定类型的service.
*/
type ServiceInstanceType = { singleton: boolean, instance: any, callback: () => Promise<any> };
export function getServiceInstances(key: any): ServiceInstanceType {
  let instances = getGlobalServices();
  return instances[key];
}

/**
 * 加载所有的bean, 并进行实例化等操作.
 */
export async function finishBeans(): Promise<void> {
  if ((global as any)[FinishAllBeanDelay]) {
    return;
  }

  let instances = getGlobalServices();

  let waitBeans = getGlobalWaitAutowiredBeans();
  for (let i in waitBeans) {
    let { key, callback, singleton, target, propertyKey, refreshScope } = waitBeans[i];
    let __bpRefreshScopeInfo = (target as any).__bpRefreshScopeInfo;
    if (!refreshScope) {
      if (__bpRefreshScopeInfo && __bpRefreshScopeInfo[propertyKey]) {
        refreshScope = true;
        waitBeans[i].refreshScope = true;
        waitBeans[i].target = null;
        waitBeans[i].propertyKey = null;
      }
    }

    if (singleton) {
      let res = await callback();
      instances[key] = { singleton, instance: res };
      await finishAutowired(key, !refreshScope);
    }
    else {
      instances[key] = {
        singleton, callback
      };
      await finishAutowired(key, !refreshScope);
    }
    getLogger().debug('[Bean load] name: ', key);
  }
  waitBeans.length = 0;

  let waitServices = getGlobalWaitAutowiredServices();
  for (let i in waitServices) {
    let { key, target, singleton } = waitServices[i];
    
    if (singleton) {
      let instance = new (target as any)();
      instances[key] = {singleton, instance};
      await finishAutowired(key, true);
    }
    else {
      let callback = async (): Promise<any> => {
        return new (target as any)();
      }
      instances[key] = {
        singleton, callback
      };
      await finishAutowired(key, true);
    }

    if (typeof key === 'string') {
      getLogger().debug('[Service load] name: ', key);
    }
    else {
      getLogger().debug('[Service load] class: ', objectUtils.getClassNameByClass(key));
    }
  }
  waitServices.length = 0;

  // 查看是否有未加载bean.
  let autos = getGlobalWaitAutowireds();
  if (autos.length > 0) {
    throw new Error(`Autowired Cannot find Bean: '${autos[0].type}'`);
  }

  (global as any)[FinishAllBeanDelay] = true;
}


/**
 * 加载所有的refreshScope bean, 并进行实例化等操作.
 */
export async function finishBeans_refreshScope(): Promise<void> {
  let instances = getGlobalServices();

  let waitBeans = getGlobalRefreshScopeAutowiredBeans();
  for (let i in waitBeans) {
    let { key, callback, singleton } = waitBeans[i];

    if (singleton) {
      let res = await callback();
      instances[key] = { singleton, instance: res };
      await finishAutowired_refreshScope(key);
    }
    else {
      instances[key] = {
        singleton, callback
      };
      await finishAutowired_refreshScope(key);
    }

    getLogger().debug('[Bean reload] name: ', key);
  }
}

/**
 * @desc 表明指定的类为Service类.
 * 
 * 定义为Service的类, 在源文件被引用后, 单例bean将会自动在全局创建一个实例.
 * 
 * @param cfg.singleton 是否为单例; (默认单例)
 * @param cfg.name      使用名称注入; 如不使用名称,则使用类型注入.
 *
 * @returns {ClassDecorator}
 */
export function Service(name: string): ClassDecorator;
export function Service(cfg?: { singleton?: boolean, name?: string }): ClassDecorator;
export function Service(...args: any[]): ClassDecorator {
  
  let cfg: any;
  if (args.length == 0 || typeof args[0] !== 'string') {
    cfg = args[0] || {};
  }
  else {
    cfg = { name: args[0] };
  }

  cfg.singleton = cfg.hasOwnProperty('singleton') ? cfg.singleton : true;
  
  let { singleton, name } = cfg;
  
  return (target: Function): void => {

    let key = febs.string.isEmpty(name) ? target : name;

    if ((target as any).__isServiced) {
      throw new Error(`@Service '${key}': It's already declared`)
    }
    (target as any).__isServiced = true;

    //
    // 判断是否重名.
    let autowiredName = (global as any)[AutowiredInstancesName] = (global as any)[AutowiredInstancesName] || {};
    let cname = objectUtils.getClassNameByClass(target);
    if (autowiredName.hasOwnProperty(cname)) {
      throw new Error(`@Service '${cname}': It's already declared`)
    }
    autowiredName[cname] = true;
    if (typeof key === 'string' && key != cname) {
      if (autowiredName.hasOwnProperty(key)) {
        throw new Error(`@Service '${key}': It's already declared`)
      }
      autowiredName[key] = true;
    }

    
    let instances = getGlobalServices();
    if (instances.hasOwnProperty(key)) {
      throw new Error(`@Service '${key}': It's already declared`)
    }
    instances[key] = null;

    if ((global as any)[FinishAllBeanDelay]) {
      if (singleton) {
        let instance = new (target as any)();
        instances[key] = { singleton, instance };
        finishAutowired(key, true).then(() => { });
      }
      else {
        let callback = async (): Promise<any> => {
          return new (target as any)();
        }
        instances[key] = {
          singleton, callback
        };
        finishAutowired(key, true).then(() => { });
      }
    }
    else {
      let waitInstances = getGlobalWaitAutowiredServices();
      waitInstances.push({
        key,
        target,
        singleton,
      });
    } // if..else.
  }
}


export function ImmediatelyService(name: string): ClassDecorator;
export function ImmediatelyService(cfg?: { singleton?: boolean, name?: string }): ClassDecorator;
export function ImmediatelyService(...args: any[]): ClassDecorator {
  
  let cfg: any;
  if (args.length == 0 || typeof args[0] !== 'string') {
    cfg = args[0] || {};
  }
  else {
    cfg = { name: args[0] };
  }

  cfg.singleton = cfg.hasOwnProperty('singleton') ? cfg.singleton : true;
  
  let { singleton, name } = cfg;
  
  return (target: Function): void => {
    let key = febs.string.isEmpty(name) ? target : name;

    if ((target as any).__isServiced) {
      throw new Error(`@Bean '${key}': It's already declared`)
    }
    (target as any).__isServiced = true;

    //
    // 判断是否重名.
    let autowiredName = (global as any)[AutowiredInstancesName] = (global as any)[AutowiredInstancesName] || {};
    let cname = objectUtils.getClassNameByClass(target);
    if (autowiredName.hasOwnProperty(cname)) {
      throw new Error(`@ImmediatelyService '${cname}': It's already declared`)
    }
    autowiredName[cname] = true;
    if (typeof key === 'string' && key != cname) {
      if (autowiredName.hasOwnProperty(key)) {
        throw new Error(`@ImmediatelyService '${key}': It's already declared`)
      }
      autowiredName[key] = true;
    }

    let instances = getGlobalServices();
    if (instances.hasOwnProperty(key)) {
      throw new Error(`@Bean '${key}': It's already declared`)
    }
    instances[key] = null;

    if (singleton) {
      let instance = new (target as any)();
      instances[key] = {singleton, instance};
      finishAutowired(key, true).then(() => { });
    }
    else {
      let callback = async (): Promise<any> => {
        return new (target as any)();
      }
      instances[key] = {
        singleton, callback
      };
      finishAutowired(key, true).then(() => { });
    }
  }
}

/**
 * @desc 表明指定的属性为Bean.
 * 
 * <Bean修饰的方法不允许带参数, 并且返回的类型作为注入对象的类型.>
 * 定义为Bean, 在源文件被引用后, 单例bean将会自动在全局创建一个实例.
 * 
 * @param cfg.singleton 是否为单例; (默认单例)
 * @param cfg.name      使用名称注入; 如不使用名称,则使用方法名注入.

 * @example
 * 
 * ﹫Service()
 * class {
 *       ﹫Bean() 
 *       foo(): Object { 
 *           return {};
 *       }
 * 
 *       ﹫Autowired('foo')
 *       private obj: Object;
 * }
 * 
 * @returns {PropertyDecorator}
 */
export function Bean(name: string): MethodDecorator;
export function Bean(cfg?: { singleton?: boolean, name?: string }): MethodDecorator;
export function Bean(...args:any[]): MethodDecorator {

  let cfg: any;
  if (args.length == 0 || typeof args[0] !== 'string') {
    cfg = args[0] || {};
  }
  else {
    cfg = { name: args[0] };
  }

  cfg.singleton = cfg.hasOwnProperty('singleton') ? cfg.singleton : true;
  
  let { singleton, name } = cfg;
  
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {

    let __bpRefreshScopeInfo = (target as any).__bpRefreshScopeInfo;
    let __bpBeanInfo = (target as any).__bpBeanInfo;
    if (!__bpBeanInfo) {
      __bpBeanInfo = (target as any).__bpBeanInfo = {};
    }
    
    if (__bpBeanInfo[propertyKey]) {
      return;
    }

    let key = febs.string.isEmpty(name) ? propertyKey : name;
        
    let instances = getGlobalServices();
    if (instances.hasOwnProperty(key)) {
      throw new Error(`@Bean '${key}': It's already declared`)
    }
    instances[key] = null;

    let callback = async (): Promise<any> => {
      let f = descriptor.value.apply(target)
      if (f instanceof Promise) {
        return await f;
      } else {
        return f;
      }
    }

    // mark.
    if (__bpRefreshScopeInfo && typeof __bpRefreshScopeInfo[propertyKey] === 'object') {
      getGlobalRefreshScopeAutowiredBeans().push({
        key,
        callback,
        singleton
      });
      __bpRefreshScopeInfo[propertyKey] = true;
      __bpBeanInfo[propertyKey] = true;
    }
    else {
      __bpBeanInfo[propertyKey] = {
        key,
        singleton,
        callback,
      }
    }

    if ((global as any)[FinishAllBeanDelay]) {
      if (singleton) {
        callback().then(res => {
          instances[key] = { singleton, instance: res };
          finishAutowired(key, false).then(() => { });
        });
      }
      else {
        instances[key] = {
          singleton, callback
        };
        finishAutowired(key, false).then(() => { });
      }
    }
    else {
      let waitInstances = getGlobalWaitAutowiredBeans();
      waitInstances.push({
        key,
        propertyKey,
        target,
        singleton,
        callback,
      });
    } // if..else.
  }
}

export function registerRefreshScopeBean(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {

  let __bpBeanInfo = (target as any).__bpBeanInfo;
  let __bpRefreshScopeInfo = (target as any).__bpRefreshScopeInfo;
  if (!__bpRefreshScopeInfo) {
    __bpRefreshScopeInfo = (target as any).__bpRefreshScopeInfo = {};
  }
  
  if (__bpRefreshScopeInfo[propertyKey]) {
    return;
  }

  if (__bpBeanInfo && __bpBeanInfo[propertyKey]) {
    getGlobalRefreshScopeAutowiredBeans().push({
      key: __bpBeanInfo[propertyKey].key,
      callback: __bpBeanInfo[propertyKey].callback,
      singleton: __bpBeanInfo[propertyKey].singleton
    });
    __bpRefreshScopeInfo[propertyKey] = true;
    __bpBeanInfo[propertyKey] = true;
  }
  else {
    __bpRefreshScopeInfo[propertyKey] = {
      callback: null,
      singleton: null,
    };
  }
}


/**
* @desc: 完成装配.
*/
async function finishAutowired(key: any, removeAtFinish:boolean) {
  let instance = getServiceInstances(key);
  if (!instance) {
    throw new Error(`Autowired Cannot find Bean : '${key}'`);
  }

  let autos = getGlobalWaitAutowireds();
  let autosRefreshScope = getGlobalWaitAutowireds_refreshScope();

  for (let i = 0; i < autos.length; i++) {
    const element = autos[i];
    if (element && element.type === key) {
      // if (typeof element.type === 'function') {
      //   console.log('finishAutowired ---- ' + objectUtils.getClassNameByClass(element.type))
      //   console.log('finishAutowired1 ---- ' + (element.target as any).constructor.__autowiredChildren)
      // } else {
      //   console.log('finishAutowired ---- ' + element.type)
      //   console.log('finishAutowired2 ---- ' + (element.target as any).constructor.__autowiredChildren)
      // }

      let instance1;
      if (instance.singleton) {
        instance1 = instance.instance;
      }
      else {
        instance1 = await instance.callback();
      }

      if (!instance1) {
        throw new Error(`Autowired Cannot find Bean: '${key}'`);
      }

      let className = typeof element.type === 'function' ? '['+objectUtils.getClassNameByClass(element.type)+']' : element.type;
      getLogger().debug(`[Autowired] ${instance.singleton ? 'singleton' : ''} ` + className);

      element.target[element.propertyKey] = instance1;

      autos.splice(i, 1);
      i--;

      if (!removeAtFinish) {
        autosRefreshScope.push(element);
      }
    }
  }
}


/**
* @desc: 完成装配.
*/
async function finishAutowired_refreshScope(key: any) {
  let instance = getServiceInstances(key);
  if (!instance) {
    throw new Error(`Autowired Cannot find Bean : '${key}'`);
  }

  let autosRefreshScope = getGlobalWaitAutowireds_refreshScope();
  for (let i in autosRefreshScope) {
    const element = autosRefreshScope[i];
    if (element && element.type === key) {
      let instance1;
      if (instance.singleton) {
        instance1 = instance.instance;
      }
      else {
        instance1 = await instance.callback();
      }

      if (!instance1) {
        throw new Error(`Autowired Cannot find Bean: '${key}'`);
      } 

      element.target[element.propertyKey] = instance1;
    }
  }
}