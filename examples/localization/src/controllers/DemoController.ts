'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { GetMapping, RequestParam, RestController, RestObject, RestObjectTypeRest } from "bpframework";
import koa from 'koa';

@RestController({path: '/locale'})
class DemoController {

  /**
   * 返回默认的语言.
   */
  @GetMapping({ path: '/default' })
  async testDefault(): Promise<any> {
    return __i18n("hello");
  }

  /**
   * 指定语言返回.
   */
  @GetMapping({ path: '/en' })
  async testEn(): Promise<any> {
    return __i18nLang('en', "hello");
  }

  /** 
   * 返回当前用户的本地语言 (请求时使用查询参数或cookie:locale=zh-cn)
   * /locale/user?locale=zh-cn  返回中文.
   * /locale/user?locale=en     返回英文.
   */
  @GetMapping({ path: '/user' })
  async testByUser(
    @RestObject obj:RestObjectTypeRest<koa.Context>,  // or RestObjectType
  ): Promise<any> {
    return obj.ctx.__i18n("hello");
  }


  /**
   * 带参数形式.
   * /locale/param?p=xxx
   */
  @GetMapping({ path: '/param' })
  async testParam(
    @RequestParam({name: 'p'}) p:string,
    @RestObject obj: RestObjectTypeRest<koa.Context>,  // or RestObjectType
  ): Promise<any> {
    return obj.ctx.__i18n("hello world: {param1}", {param1: p});
  }
}
