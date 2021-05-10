'use strict';


/**
* Copyright (c) 2015 Copyright citongs All Rights Reserved.
* Author: 
* Desc:
*/

import { Msg } from "@originforest/common";
import { Application } from "bpframework";
import { AliyunSMS } from "./aliyun";
import { ISMS } from "./ISMS";
import { YunpianSMS } from "./yunpian";


export function createSMSInstance(): ISMS {
  let platform = Application.getConfig()['sms.platform'];
  if (platform == 'yunpian') {
    return new YunpianSMS();
  }
  else if (platform == 'aliyun') {
    return new AliyunSMS();
  }

  return null;
}