'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { FeignClient, RequestBody, RequestMapping, RequestMethod, RestObject, RestObjectTypeFeign, Service } from "bpframework";
import { DemoFeignClientBean } from "./DemoFeignClientBean";

@Service()
@FeignClient({name: 'user-service'})
export class DemoFeignClient {

  /**
   * 对/api的请求.
   */
  @RequestMapping({ path: '/api/{a}/{b}', method: RequestMethod.POST, feignCastType:DemoFeignClientBean })
  async request(
    @RequestBody body:string,
    @RestObject obj?: RestObjectTypeFeign,  // or RestObjectType
  ): Promise<DemoFeignClientBean> {
    throw new Error('fallback');
  }
}
