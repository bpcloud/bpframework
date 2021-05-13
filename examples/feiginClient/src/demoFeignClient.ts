'use strict';


/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-11 14:42
* Desc: 
*/

import { FeignClient, RequestMapping, RequestMethod, RestObject, RestObjectTypeFeign } from "bpframework";

@FeignClient({
  /** 指定微服务的名称; 也可使用url来指定通信地址作为调试使用. */
  name: 'demo-microservice-name',
  /** 定义FeignClient类中请求的统一前缀 */
  path: '/api'
})
class DemoFeignClient {
  /**
   * 使用 RequestMapping 定义接口.
   */
  @RequestMapping({
    path: '/test1', // route路径 = /api/test1.
    method: RequestMethod.GET,  // method.
    headers: { "X-Custom-Header": "aaa" }, // response header.
    timeout: 10000,           /** 请求超时 (ms), 默认为5000 */
    mode: 'cors',             /** 请求的跨域模式 */
    credentials: null,        /** 是否携带cookie */
    feignCastType: Boolean,   /** 指定feignClient response的数据类型 */
  })
  async test1(@RestObject restObj?: RestObjectTypeFeign): Promise<boolean> {
    // fallback 处理.
    throw new Error('fallback');
  }
}

//
// 可在框架初始化完成之后调用如下语句进行微服务通信.
// await new DemoFeignClient().test1();
