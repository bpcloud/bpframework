'use strict';


/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-11 14:42
* Desc: 
*/

import { GetMapping, RestController } from "bpframework";

@RestController()
class DemoRestController{
  @GetMapping({path: '/test1'})
  private test1(): string {
    return "test";
  }
}
