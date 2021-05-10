'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { Type } from "febs-decorator";
import * as febs from 'febs';

/**
 * 单独发送参数.
 */
export class SMSBean {
  @Type.Validator({
    checkCB(elem: any) { return febs.string.isPhoneMobile(elem) ? null : false; }
  })
  phone: string;

  /** 短信模板. */
  template: string;

  /** 模板参数 */
  params: any;
}

/**
 * 批量发送参数.
 */
export class SMSBatchBean {
  @Type.Array({
    checkCB(elem: any, index: number, arr: any[]) { return febs.string.isPhoneMobile(elem) ? null : false; }
  })
  phones: string[];

  /** 短信模板. */
  template: string;

  /** 模板参数 */
  params: any;
}
