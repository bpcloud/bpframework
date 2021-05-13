'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-11-11 14:42
 * Desc:
 */

import {
  GetMapping,
  RequestParam,
  RestController,
} from 'bpframework'

@RestController()
default class {
  /**
   * 指定查询参数.
   */
  @GetMapping({
    path: '/request', // route路径 = /request?param=xxx
  })
  test1(
    @RequestParam({
      name: 'param', // 在路径上的参数名.
      required: true, // 是否必须存在.
      defaultValue: 'defaultValue', // 查询参数不存在的默认值.
      castType: String, // 将路径参数转换为指定类型.
    })
    param: string // 表示请求路径上的 {param} 参数.
  ): string {
    console.log(param)
    return 'ok'
  }
}
