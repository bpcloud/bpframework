'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-11-11 14:42
 * Desc:
 */

import {
  GetMapping,
  RestController,
  RestObject,
  RestObjectType,
  RestObjectTypeRest,
} from 'bpframework'

import koa from 'koa';

@RestController()
default class {
  /**
   * 定义restObject.
   */
  @GetMapping({
    path: '/restobject1',
  })
  test1(
    @RestObject restObject: RestObjectTypeRest<koa.Context> // 表示rest对象, 可以进行详细的header操作等.
  ): string {
    console.log(restObject.request)  // request内容.
    console.log(restObject.response) // response内容.
    console.log(restObject.ctx)      // 当前请求上下文.
    return 'ok'
  }

    /**
   * 定义restObject.
   */
  @GetMapping({
    path: '/restobject2',
  })
  test2(
    @RestObject() restObject: RestObjectType // 表示rest对象, 可以进行详细的header操作等.
  ): string {
    console.log(restObject)
    return 'ok'
  }
}
