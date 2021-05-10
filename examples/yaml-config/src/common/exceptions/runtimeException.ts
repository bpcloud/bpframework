'use strict';

/**
* Copyright (c) 2017 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-07-31 15:51
* Desc: 运行时错误.
*/

import * as febs from 'febs';

import {errorCode, getErrorCodeMsg} from '@originforest/common';

import exception from './exception';

export default class extends exception {
  /**
  * @desc: 构造异常对象.
  * @param msg: 异常消息
  * @param code: 异常代码
  * @param filename: 异常文件名
  * @param line: 异常文件所在行
  * @return: 
  */
  constructor(msg:string, filename:string, line:number, column:number) {
    let code = getErrorCodeMsg(errorCode.SERVICE_ERROR);
    super(msg, code, filename, line, column);
  }
};
