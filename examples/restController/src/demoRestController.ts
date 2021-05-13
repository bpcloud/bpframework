'use strict';


/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-11 14:42
* Desc: 
*/

import { GetMapping, RequestMapping, RequestMethod, RestController } from "bpframework";

@RestController({
  path: '/api'
})
default class {

  /**
   * 使用 RequestMapping 定义接口.
   */
  @RequestMapping({
    path: '/test1', // route路径 = /api/test1.
    method: RequestMethod.GET,  // method.
    headers: {"X-Custom-Header": "aaa"} // response header.
  })
  test1(): string {
    return "test";
  }

  /**
   * 使用 GetMapping 定义接口.
   * 另外可以使用:
   * 
      | `@PostMapping`   | 定义一个post请求   |
      | `@GetMapping`    | 定义一个get请求    |
      | `@DeleteMapping` | 定义一个delete请求 |
      | `@PutMapping`    | 定义一个put请求    |
      | `@PatchMapping`  | 定义一个patch请求  |
   */
  @GetMapping({
    path: '/test2', // route路径 = /api/test1.
  })
  test2(): string {
    return "test";
  }

}
