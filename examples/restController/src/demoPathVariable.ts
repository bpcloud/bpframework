'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-11-11 14:42
 * Desc:
 */

import {
  GetMapping,
  PathVariable,
  RestController,
  IgnoreRestLogger,
} from 'bpframework'

@RestController()
default class {
  /**
   * 指定请求路径参数.
   */
  @IgnoreRestLogger // IgnoreRestLogger 会忽略无异常的rest请求日志.
  @GetMapping({
    path: '/param/{param}', // route路径 = /param/{param}.
  })
  test1(
    @PathVariable({
      name: 'param', // 在路径上的参数名.
      required: true, // 是否必须存在.
      castType: String, // 将路径参数转换为指定类型.
    })
    param: string // 表示请求路径上的 {param} 参数.
  ): string {
    console.log(param)
    return 'ok'
  }
}
