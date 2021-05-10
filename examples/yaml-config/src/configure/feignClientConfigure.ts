'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { Service, FeignClientConfigure } from "bpframework";
import { FeignClientConfigureInfo, FeignClientFilterResponseData } from "bpframework/types";

@Service()
class Configure {
  @FeignClientConfigure
  onConfigure(): FeignClientConfigureInfo {
    return {
      // 默认headers.
      defaultHeaders: {'content-type': 'application/json;charset=utf-8'},
      // 消息过滤.
      filterResponseCallback: (data: FeignClientFilterResponseData) => {
        
      }
    } // 
  }
}