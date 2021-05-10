'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { FeignClient, RequestBody, RequestMapping, RequestMethod, RestObject, RestObjectTypeFeign, Service } from "bpframework";
import { SignFeignClientBean } from "./SignFeignClientBean";

@Service()
@FeignClient({ name: 'admin-service', url: 'http://dev.bpfaas.com:30081'})
export class SignFeignClient {

  /**
   * 对/api的请求.
   */
  @RequestMapping({ path: '/v1/sd/service/definition/associationsWithKey', headers: { 'faas-service-id': 'notification-service', 'faas-service-sign': 'Q1bEJ7tTwavn20KFaNZGmFrIMX7tNUzkTdFw0VOMgv6gSfkMgjpzGMpYQK97EFApKwF6PrvnkQxMW53AXIKlKj/WCYfLSjZqUZhdOiSGyAFEapfsWdZIuvfXhwjkc5KNeDo7ZIagl9l3ccEQoTJfxdVDjCiUZKtFMX8y2+7mYJg=' }, method: RequestMethod.GET, feignCastType: SignFeignClientBean })
  async associationsWithKey(@RequestBody body?: string, @RestObject obj?: RestObjectTypeFeign): Promise<SignFeignClientBean> {
    console.log(obj);
    throw new Error('fallback');
  }
}
