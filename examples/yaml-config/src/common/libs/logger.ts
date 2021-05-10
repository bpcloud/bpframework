
'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2017-06-16
* Desc: 
*/

import * as febs from 'febs';
import * as log4js from 'log4js';
import * as path from 'path';

export default {
  /**
   * @desc: 获取Error对象的信息
   */
  getErrorMsg,

  /**
   * @desc: 初始化日志系统
   */
  install,

  /**
   * @desc: debug下日志.
   *        (仅dev方式下输出)
   */
  debug,
  
  /**
   * @desc: info, 普通日志.
   *        (dev/prod方式下都将输出)
   */
  info,

  /**
   * @desc: warn, 普通日志.
   *        (dev/prod方式下都将输出)
   */
  warn,

  /**
   * @desc: 错误日志.
   *        (dev/prod方式下都将输出)
   */
  error,

  /**
   * @desc: 支付相关的日志.
   */
  pay_log,
  pay_err,
  pay_debug,

  /**
  * @desc: 数据库相关操作记录.
  * @return: 
  */
  db_add,
  db_remove,
  db_update,
  db_err,
  db_warn,
  db_log,
  db_debug,
}


function getErrorMsg(e:any) :string {
  if (e instanceof Error) {
    return `${e.message}\n${e.stack}`;
  }
  else if (typeof e === 'object') {
    try {
      e = JSON.stringify(e);
    } catch (err) {
      e = 'LOG catch in JSON.stringify';
    }
    return e;
  }
  else {
    return (e?e.toString():'');
  }
}

function getOperatorMsg(e:any) :string {
  if (e instanceof Error) {
    return `by operator: ${e.message}\n${e.stack}\n`;
  }
  else if (typeof e === 'object') {
    try {
      e = 'by operator: ' + JSON.stringify(e) + '\n';
    } catch (err) {
      e = 'by operator:  LOG catch in JSON.stringify; ';
    }
    return e;
  }
  else {
    return (e?'by operator: '+e.toString() + '; ':'');
  }
}

function info(msg:string, operator:string=null, filename:string=null, line=0, column=0) {
  msg = getErrorMsg(msg);

  let logger = log4js.getLogger('info');
  let log = getOperatorMsg(operator) + msg;
  if (filename) log += '\r\n' + filename + '(' + line + ',' + column + ')';
  logger.info(log);
}

function debug(msg:string, operator:string=null, filename:string=null, line=0, column=0) {
  if (__debug) {
    msg = getErrorMsg(msg);

    let logger = log4js.getLogger('debug');
    let log = getOperatorMsg(operator) + msg;
    if (filename) log += '\r\n' + filename + '(' + line + ',' + column + ')';
    logger.debug(log);
  }
}

function warn(msg:string, operator:string=null, filename:string=null, line=0, column=0) {
  msg = getErrorMsg(msg);

  let logger = log4js.getLogger('warn');
  let log = getOperatorMsg(operator) + msg;
  if (filename) log += '\r\n' + filename + '(' + line + ',' + column + ')';
  logger.warn(log);
}

function error(msg:string|any, operator:string=null, filename:string=null, line=0, column=0) {  
  msg = getErrorMsg(msg);
  
  let logger = log4js.getLogger('error');
  let log = getOperatorMsg(operator) + msg;
  if (filename) log += '\r\n' + filename + '(' + line + ',' + column + ')';
  logger.error(log);
}


function pay_log(msg:string, operator:string=null, filename:string=null, line=0, column=0) {
  msg = getErrorMsg(msg);

  let logger = log4js.getLogger('pay');
  let log = getOperatorMsg(operator) + msg;
  if (filename) log += '\r\n' + filename + '(' + line + ',' + column + ')';
  logger.info(log);
}


function pay_debug(msg:string, operator:string=null, filename:string=null, line=0, column=0) {
  if (__debug) {
    msg = getErrorMsg(msg);

    let logger = log4js.getLogger('paydebug');
    let log = getOperatorMsg(operator) + msg;
    if (filename) log += '\r\n' + filename + '(' + line + ',' + column + ')';
    logger.debug(log);
  }
}




function pay_err(msg:string, operator:string=null, filename:string=null, line=0, column=0) {
  msg = getErrorMsg(msg);

  let logger = log4js.getLogger('payerror');
  let log = getOperatorMsg(operator) + msg;
  if (filename) log += '\r\n' + filename + '(' + line + ',' + column + ')';
  logger.error(log);
}

/**
* @desc: 删除数据.
* @param operator: 操作员id.
* @param realDel: 是否真实删除, 默认为false
* @return: 
*/
function db_remove(operator:string, table:string, where:string, realDel=false) {
  let logger = log4js.getLogger('db');
  logger.info(`${getOperatorMsg(operator)} remove ${table} ${where?'where='+where+',':''} realDel=${realDel}`);
}

/**
* @desc: 修改数据.
* @param operator: 操作员id.
* @param newData: 更新的数据. json格式对象.
* @return: 
*/
function db_update(operator:string, table:string, where:string, newData:any) {
  let logger = log4js.getLogger('db');
  logger.info(`${getOperatorMsg(operator)} update ${table} ${where?'where='+where+',':''} data = (${JSON.stringify(newData)})`);
}

/**
* @desc: 添加数据.
* @param operator: 操作员id.
* @param newData: 添加的数据. json格式对象.
* @return: 
*/
function db_add(operator:string, table:string, newData:any) {
  let logger = log4js.getLogger('db');
  logger.info(`${getOperatorMsg(operator)} add ${table} data = (${JSON.stringify(newData)})`);
}

function db_debug(operator:string, err:any) {
  if (__debug) {
    let logger = log4js.getLogger('dbdebug');
    logger.debug(`${getOperatorMsg(operator)} debug: ${err.toString()}`);
  }
}
function db_err(operator:string, err:any) {
  let logger = log4js.getLogger('dberror');
  logger.error(`${getOperatorMsg(operator)} error: ${err.toString()}`);
}

function db_warn(operator:string, warn:any) {
  let logger = log4js.getLogger('dbwarn');
  logger.warn(`${getOperatorMsg(operator)} warn: ${warn.toString()}`);
}

function db_log(operator:string, msg:string) {
  let logger = log4js.getLogger('db');
  logger.info(`${getOperatorMsg(operator)} sql: ${msg.toString()}`);
}

/**
* @desc: 初始化日志模块.
* @param name: 日志模块名.
* @param logDir: 日志文件存储的目录
* @return: 
*/
function install(name:string, logDir:string=null) {
  let cfg;
  
  if (!logDir) {
    cfg = {
      appenders: {
        everything: { type: 'console' },
        debug: { type: 'console' },
        error: { type: 'console' },
        warn: { type: 'console' },
        db: { type: 'console' },
        dberror: { type: 'console' },
        dbwarn: { type: 'console' },
        dbdebug: { type: 'console' },
        pay: { type: 'console' },
        payerror: { type: 'console' },
        paydebug: { type: 'console' },
      },
      categories: {
        default: { appenders: ['everything'], level: 'INFO' },
        info: { appenders: ['everything'], level: 'INFO' },
        debug: { appenders: ['debug'], level: 'DEBUG' },
        error: { appenders: ['error'], level: 'ERROR' },
        warn: { appenders: ['warn'], level: 'WARN' },
        db: { appenders: ['db'], level: 'INFO' },
        dberror: { appenders: ['dberror'], level: 'ERROR' },
        dbwarn: { appenders: ['dbwarn'], level: 'ERROR' },
        dbdebug: { appenders: ['dbdebug'], level: 'DEBUG' },
        pay: { appenders: ['pay'], level: 'INFO' },
        payerror: { appenders: ['payerror'], level: 'ERROR' },
        paydebug: { appenders: ['payerror'], level: 'DEBUG' },
      },
      disableClustering: true,
    };
  } else {
    logDir = path.join(logDir, name);
    cfg = {
      appenders: {
        everything: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true },
        debug: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.debug', alwaysIncludePattern: true },
        error: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.err', alwaysIncludePattern: true },
        warn: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.warn', alwaysIncludePattern: true },
        db: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.db.log', alwaysIncludePattern: true },
        dberror: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.db.err', alwaysIncludePattern: true },
        dbwarn: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.db.warn', alwaysIncludePattern: true },
        dbdebug: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.db.debug', alwaysIncludePattern: true },
        pay: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.finance.log', alwaysIncludePattern: true },
        payerror: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.finance.err', alwaysIncludePattern: true },
        paydebug: { type: 'dateFile', filename: logDir, pattern: 'yyyy-MM-dd.finance.debug', alwaysIncludePattern: true },
      },
      categories: {
        default: { appenders: ['everything'], level: 'INFO' },
        info: { appenders: ['everything'], level: 'INFO' },
        debug: { appenders: ['debug'], level: 'DEBUG' },
        error: { appenders: ['error'], level: 'ERROR' },
        warn: { appenders: ['warn'], level: 'WARN' },
        db: { appenders: ['db'], level: 'INFO' },
        dberror: { appenders: ['dberror'], level: 'ERROR' },
        dbwarn: { appenders: ['dbwarn'], level: 'ERROR' },
        dbdebug: { appenders: ['dbdebug'], level: 'DEBUG' },
        pay: { appenders: ['pay'], level: 'INFO' },
        payerror: { appenders: ['payerror'], level: 'ERROR' },
        paydebug: { appenders: ['paydebug'], level: 'DEBUG' },
      },
      disableClustering: true,
    };
  }

  log4js.configure(cfg);
}
