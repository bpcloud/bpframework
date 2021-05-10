'use strict';

/**
* Copyright (c) 2015 Copyright citongs All Rights Reserved.
* Author: 
* Desc:
*/

import { logger } from '@/libs/logger';
import { errorCode, Msg } from '@originforest/common';
import { Application, getErrorMessage } from 'bpframework';
import * as febs from 'febs';
import { Service } from 'febs-decorator';
import * as qs from 'querystring';
import { ISMS } from '../ISMS';

import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';

const LOG_TAG = '[sms] aliyun: ';

/**
 * 使用id模板方式发送短信.
 */
// @Service(true)
export class AliyunSMS implements ISMS {
  /**
  * @desc: 发送短信到指定手机.
  * @param template: 短信模板
  * @param params: 模板参数
  */
  async send(phone: string, template: string, params: BaseBean): Promise<Msg> {
    let client = AliyunSMS.createClient(Application.getConfig()['sms.accessKeyId'], Application.getConfig()['sms.accessKeySecret']);
    let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      PhoneNumbers: phone,
      SignName: Application.getConfig()['sms.signName'],
      TemplateCode: template,
      TemplateParam: params ? JSON.stringify(params) : undefined,
      
    });
    // 复制代码运行请自行打印 API 的返回值
    try {
      let ret = await client.sendSms(sendSmsRequest);
      if (!ret) {
        return { err_code: errorCode.SERVICE_ERROR };
      }

      if (ret.body.code == 'OK') {
        logger.info(`${LOG_TAG} ${template + ': ' + JSON.stringify(params || {})};`, null, __filename, __line, __column);
        return { err_code: errorCode.OK };
      }
      else {
        logger.error(`${LOG_TAG} ${template + ': ' + JSON.stringify(params || {})};` + logger.getErrorMessage(JSON.stringify(ret.body)), null, __filename, __line, __column);
        return { err_code: errorCode.SERVICE_ERROR, err_msg: ret.body.message };
      }
    } catch (e) {
      logger.error(`${LOG_TAG} ${template + ': ' + JSON.stringify(params || {})};` + logger.getErrorMessage(e), null, __filename, __line, __column);
      return { err_code: errorCode.SERVICE_ERROR, err_msg: getErrorMessage(e) };
    }
  }

  /**
  * @desc: 批量发送短信到指定手机.
  * @param template: 短信模板
  * @param params: 模板参数
  */
  async sendBatch(phones: string[], template: string, params: BaseBean): Promise<Msg> {

    phones = Array.from(new Set(phones));

    if (phones.length > 1000) {
      return { err_code: errorCode.PARAMETER_ERROR, err_msg: '最多只允许设置1000个号码' };
    }

    let phonestr = '';
    phones.forEach(element => {
      if (phonestr.length > 0) phonestr += ',';
      phonestr += element;
    });

    let client = AliyunSMS.createClient(Application.getConfig()['sms.accessKeyId'], Application.getConfig()['sms.accessKeySecret']);
    let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      PhoneNumbers: phonestr,
      SignName: Application.getConfig()['sms.signName'],
      TemplateCode: template,
      TemplateParam: params ? JSON.stringify(params) : undefined,
    });

    // 复制代码运行请自行打印 API 的返回值
    try {
      let ret = await client.sendSms(sendSmsRequest);
      if (!ret) {
        return { err_code: errorCode.SERVICE_ERROR };
      }

      if (ret.body.code == 'OK') {
        logger.info(`${LOG_TAG} ${template + ': ' + JSON.stringify(params || {})};`, null, __filename, __line, __column);
        return { err_code: errorCode.OK };
      }
      else {
        logger.error(`${LOG_TAG} ${template + ': ' + JSON.stringify(params || {})};` + logger.getErrorMessage(JSON.stringify(ret.body)), null, __filename, __line, __column);
        return { err_code: errorCode.SERVICE_ERROR, err_msg: ret.body.message };
      }
    } catch (e) {
      logger.error(`${LOG_TAG} ${template + ': ' + JSON.stringify(params || {})};` + logger.getErrorMessage(e), null, __filename, __line, __column);
      return { err_code: errorCode.SERVICE_ERROR, err_msg: getErrorMessage(e) };
    }
  }
  
  private static createClient(accessKeyId: string, accessKeySecret: string): Dysmsapi20170525 {
    let config = new $OpenApi.Config({
      // 您的AccessKey ID
      accessKeyId: accessKeyId,
      // 您的AccessKey Secret
      accessKeySecret: accessKeySecret,
    });
    // 访问的域名
    config.endpoint = "dysmsapi.aliyuncs.com";
    return new Dysmsapi20170525(config);
  }
}
