'use strict'

/**
 * Copyright (c) 2017 Copyright tj All Rights Reserved.
 * Author: lipengxiang
 * Date: 2018-11-29 15:47
 * Desc:
 */


import * as koa from 'koa'
import {Msg, errorCode} from '@originforest/common';

import {database} from '../../db/base';
import logger from '../libs/logger';
import exception from './exception';

/**
 * @desc: 解析错误处理.
 */
export function onErrorBodyParser(err:any, ctx:koa.Context) {
  // if (__debug) {
  //   console.error(err);
  // }
  ctx.response.body = {
    err: errorCode.PARAMETER_ERROR,
    err_msg: '参数格式错误!'
  }
}


/**
* @desc: api错误处理.
*/
export function onErrorApiHandle(err:any, ctx:koa.Context) {

  // 返回 msg.
  if (err && typeof err.err === 'string' && typeof err.err_msg === 'string') {
    return err;
  }

  logger.error('[API] ' + logger.getErrorMsg(err), null, __filename, __line, __column);

  // 数据库错误.
  if (err instanceof database.exception) {
    return {err:errorCode.SERVICE_ERROR, err_msg: '数据库错误'};
  }
  else if (err === 'timeout') {
    return {err:errorCode.SERVICE_UNAVAILABLE, err_msg: '服务超时'};
  }
  else if (err instanceof exception) {
    return {err:err.code, err_msg: err.message};
  }
  else {
    return {err:errorCode.SERVICE_ERROR, err_msg: 'unknow error'};
  }
}

