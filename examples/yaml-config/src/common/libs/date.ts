'use strict';
/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2018-05-21 20:01
* Desc: 日期工具; 用于对Date对象 序列化, 并用作参数传递.
*/

import * as febs from 'febs';


export default {
  /**
  * @desc: 是否有效时间.
  */
  isValidate,

  // date -> str.
  date2utcstr,
  datetime2utcstr,
  datetimeMS2utcstr,

  // str -> date.
  utcstr2date,
}

/**
* @desc: 判断是否是有效时间.
* @return: 
*/
function isValidate(date:Date) :boolean {
  return febs.date.isValidate(date);
}

/**
* @desc: 将日期返回为 '2017010101' yyyyMMddHH 的方式.
* @return: 无效时间返回null.
*/
function date2utcstr(date:Date) :string {
  if (!isValidate(date))  return null;
  return febs.date.getUTCTimeString(date.getTime(), 'yyyyMMddHH', null);
}


/**
* @desc: 将日期返回为 '20170101121312' yyyyMMddHHmmss  的方式.
* @return: 无效时间返回null.
*/
function datetime2utcstr(date:Date) :string {
  if (!isValidate(date))  return null;
  return febs.date.getUTCTimeString(date.getTime(), 'yyyyMMddHHmmss', null);
}

/**
* @desc: 将日期返回为 '20170101121312123' yyyyMMddHHmmssSSS  的方式.
* @return: 无效时间返回null.
*/
function datetimeMS2utcstr(date:Date) :string {
  if (!isValidate(date))  return null;
  let t = febs.date.getUTCTimeString(date.getTime(), 'yyyyMMddHHmmss', null);
  let m = date.getUTCMilliseconds() as any;
  if (m < 100) {
    if (m >= 10) {
      m = '0' + m;
    }
    else if (m >= 1) {
      m = '00' + m;
    }
    else {
      m = '000';
    }
  }
  t += m;
  return t;
}

/**
* @desc: 将字符串时间返回为 Date的方式.
* @return: 无效时间返回null.
*/
function utcstr2date(dateStr:string) :Date {
  try {
    if (dateStr.length == 10) dateStr += '0000000';
    else if (dateStr.length == 12) dateStr += '00000';
    else if (dateStr.length == 14) dateStr += '000';
    else if (dateStr.length != 17) return null;

    let d = dateStr.substr(0, 14);
    let m = dateStr.substr(14)||1;
    let t = febs.date.getTime2FromUTC(d);
    t.setUTCMilliseconds(Number(m));
    return t;
  } catch(e) { return null; }
}
