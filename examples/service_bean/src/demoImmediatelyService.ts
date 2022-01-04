'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/
import { ImmediatelyService } from "bpframework";


/**
* @desc: ImmediatelyService 的使用方式和 Service一样, 
*        但是会立即装载, 而无需等待 ContextRefreshedEvent 事件执行之后才完成装载
*/
@ImmediatelyService("ImmediateService")
class ImmediateService {
  constructor() {
    // console.log("Immediately demo service")
  }
}
