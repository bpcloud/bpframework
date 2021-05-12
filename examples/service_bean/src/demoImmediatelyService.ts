'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/
import { Service } from "febs-decorator";


/**
* @desc: 匿名Service, 需使用类来进行Autowired装载. 
*/
@Service()
export class DemoService {
  constructor() {
  }
}

/**
* @desc: 指定名称的Service, 可以需使用名称来进行Autowired装载
*/
@Service('DemoServiceByName')
class DemoServiceByName {
  constructor() {
  }
}

/**
* @desc: 非单例的service, 会在每次装载时创建一个新的实例.
*        (默认)单例的service, 会在程序初始化完成时自动在全局创建一个实例.
*/
@Service({ name: 'DemoServiceUnSingleton', singleton: false})
class DemoServiceUnSingleton {
  constructor() {
    console.log('DemoServiceUnSingleton');
  }
}