'use strict';

/**
* Copyright (c) 2015 Copyright citongs All Rights Reserved.
* Author: 
* Desc:
*/

import { logger } from '@/libs/logger';
import { errorCode, Msg } from '@originforest/common';
import { Application } from 'bpframework';
import * as febs from 'febs';
import { Service } from 'febs-decorator';
import * as qs from 'querystring';
import { ISMS } from '../ISMS';



const LOG_TAG = '[sms] yunpian: ';
const send_sms_uri = 'https://sms.yunpian.com/v2/sms/tpl_single_send.json';
const sendBatch_sms_uri = 'https://sms.yunpian.com/v2/sms/tpl_batch_send.json';


/**
 * 使用id模板方式发送短信.
 */
// @Service(true)
export class YunpianSMS implements ISMS {
  /**
  * @desc: 发送短信到指定手机.
  * @param template: 短信模板
  * @param params: 模板参数
  */
  async send(phone: string, template: string, params: BaseBean): Promise<Msg> {

    let post_data = {
      'apikey' : Application.getConfig()['sms.accessKeyId'],
      'mobile' : phone,
      'tpl_id': Number(template),
      'tpl_value': this.formatParams(params)
    };
    
    var content = qs.stringify(post_data);
    let msg = await this.post(send_sms_uri, content, template + ': ' + JSON.stringify(params || {}));
    if (!msg) {
      return { err_code: errorCode.OK };
    }
    else {
      return {err_code: errorCode.SERVICE_ERROR, err_msg: msg};
    }
  }

  /**
  * @desc: 批量发送短信到指定手机.
  * @param template: 短信模板
  * @param params: 模板参数
  */
  async sendBatch(phones: string[], template: string, params: BaseBean): Promise<Msg> {
    
    phones = Array.from(new Set(phones));
    
    let phonestr = '';
    phones.forEach(element => {
      if (phonestr.length > 0) phonestr += ',';
      phonestr += element;
    });

    let post_data = {
      'apikey' : Application.getConfig()['sms.accessKeyId'],
      'mobile' : phonestr,
      'tpl_id': Number(template),
      'tpl_value': this.formatParams(params)
    };
    
    var content = qs.stringify(post_data);
    let msg = await this.post(sendBatch_sms_uri, content, template + ': ' + JSON.stringify(params || {}));
    if (!msg) {
      return { err_code: errorCode.OK };
    }
    else {
      return {err_code: errorCode.SERVICE_ERROR, err_msg: msg};
    }
  }

  private formatParams(params: BaseBean): string {
    if (!params) return undefined;
    let msg = '';
    for (const key in params) {
      const element = params[key];
      msg += encodeURIComponent('#' + key + '#') + '=' + encodeURIComponent(element);
    }
    return encodeURIComponent(msg);
  }

  private formatMessage(template: string, params: BaseBean): string {
    for (const key in params) {
      const element = params[key];
      template = febs.string.replace(template, `{${key}}`, element);
    }
    return template;
  }
  
  private async post(url:string, content:string, srcText:string): Promise<string> {
    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: content,
      timeout: Application.getConfig()['sms.timeout'],
    };

    try {
      let ret:any = await febs.net.fetch(url, options);
      if (ret) {
        ret = await ret.json();
        if (ret.code == 0) {
          logger.info(`${LOG_TAG} ${srcText};`, null, __filename, __line, __column);
          return null;
        } else {
          logger.error(`${LOG_TAG} ${srcText}; ` + JSON.stringify(ret), null, __filename, __line, __column);
          return ret.msg || '发送错误';
        }
      }
    } catch (e) {
      logger.error(`${LOG_TAG} ${srcText}; ` + logger.getErrorMessage(e), null, __filename, __line, __column);
      return '发送错误';
    }

    logger.error(`${LOG_TAG} ${srcText};`, null, __filename, __line, __column);
    return '发送错误';
  }
}
