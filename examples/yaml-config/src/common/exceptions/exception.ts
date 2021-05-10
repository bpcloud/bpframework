'use strict';

/**
* Copyright (c) 2017 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-07-31 15:51
* Desc: 操作正在进行.
*/

import * as febs from 'febs';

export default class extends febs.exception {

  column:number;

  /**
  * @desc: 构造异常对象.
  * @param msg: 异常消息
  * @param code: 异常代码
  * @param filename: 异常文件名
  * @param line: 异常文件所在行
  * @return: 
  */
  constructor(msg:string, code:string, filename:string, line:number, column:number) {
    super(msg, code, filename, line);
    this.column = column;
  }
};
