'use strict';


/**
* Copyright (c) 2015 Copyright citongs All Rights Reserved.
* Author: 
* Desc:
*/

import { Msg } from "@originforest/common";


export interface ISMS {
  
  /**
  * @desc: 发送短信到指定手机.
  * @param template: 短信模板; 全文字类模板, 其中参数处必须使用 {paramName} 形式.
  * @param params: 模板参数
  */
  send(phone: string, template: string, params: BaseBean): Promise<Msg>;
  
  /**
  * @desc: 批量发送短信到指定手机.
  * @param template: 短信模板; 全文字类模板, 其中参数处必须使用 {paramName} 形式.
  * @param params: 模板参数
  */
  sendBatch(phones:string[], template:string, params:BaseBean): Promise<Msg>;
}
