'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import * as koa from 'koa';
import { Application, PostMapping, RefreshRemoteEvent, RequestBody, RestController, RestObject, RestObjectTypeRest } from "bpframework";
import { ISMS } from '@/libs/sms/ISMS';
import { createSMSInstance } from '@/libs/sms';
import { SMSBatchBean, SMSBean } from './SMSBean';
import { Msg } from '@originforest/common';

@RestController({path: '/v1'})
class SMSController {

  private smsService: ISMS;

  constructor() {
    this.smsService = createSMSInstance();
    Application.addRefreshRemoteEventListener((ev: RefreshRemoteEvent) => {
      if (ev.isContainUpdated('sms.platform')) {
        this.smsService = createSMSInstance();
      }
    });
  }

  /**
   * 发送单条短信.
   */
  @PostMapping({ path: '/sms' })
  async sms(
    @RequestBody({castType: SMSBean}) body:SMSBean,
    @RestObject obj:RestObjectTypeRest<koa.Context>,  // or RestObjectType
  ): Promise<Msg> {
    return this.smsService.send(body.phone, body.template, body.params);
  }

  /**
   * 群发短信.
   */
  @PostMapping({ path: '/smsBatch' })
  async smsBatch(
    @RequestBody({castType: SMSBatchBean}) body:SMSBatchBean,
    @RestObject obj:RestObjectTypeRest<koa.Context>,  // or RestObjectType
  ): Promise<Msg> {
    return this.smsService.sendBatch(body.phones, body.template, body.params);
  }
}
