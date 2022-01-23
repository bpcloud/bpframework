'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-11-11 14:42
 * Desc:
 */

import {
  GetMapping,
  PostMapping,
  RequestBody,
  RestController,
} from 'bpframework'

@RestController()
class DemoRequestBody{
  /**
   * 指定content body.
   */
  @PostMapping({
    path: '/body1',
  })
  test1(
    @RequestBody body: any // 表示请求体.
  ): string {
    console.log(body)
    return 'ok'
  }

  /**
   * 指定content body.
   */
  @PostMapping({
    path: '/body2',
  })
  test2(
    @RequestBody({
      required: true, // 是否必须.
      castType: String, // 将请求体的内容转换为指定的数据类型.
    })
    body: any // 表示请求体.
  ): string {
    console.log(body)
    return 'ok'
  }
}
