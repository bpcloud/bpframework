'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2017-06-06
* Desc: 对请求参数进行验证.
*/

import * as koa from 'koa';
import * as febs from 'febs';
import {errorCode, Msg} from '@originforest/common';

function isNumber(n:any) {
  return typeof n == 'number';
}

const Regex_date1 = /^((?!0000)[0-9]{4}((0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-8])|(0[13-9]|1[0-2])(29|30)|(0[13578]|1[02])31)|([0-9]{2}(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[13579][26])00)0229)([0-1][0-9]|2[0-4])$/;
const Regex_date2 = /^((?!0000)[0-9]{4}((0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-8])|(0[13-9]|1[0-2])(29|30)|(0[13578]|1[02])31)|([0-9]{2}(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[13579][26])00)0229)([0-1][0-9]|2[0-4])([0-5][0-9])$/;
const Regex_date3 = /^((?!0000)[0-9]{4}((0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-8])|(0[13-9]|1[0-2])(29|30)|(0[13578]|1[02])31)|([0-9]{2}(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[13579][26])00)0229)([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])$/;
const Regex_date4 = /^((?!0000)[0-9]{4}((0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-8])|(0[13-9]|1[0-2])(29|30)|(0[13578]|1[02])31)|([0-9]{2}(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[13579][26])00)0229)([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])([0-9][0-9][0-9])$/;

const err_locale = '参数 {arg} 格式不正确';

/**
* @desc: check_xxx: 如果参数不是指定类型则返回errCode.PARAMS,返回返回null.
* @return: 
*/
export default {
  get_boolean,

  check_login,

  check_boolean,
  check_boolean_null, // 可为null或undefined.

  check_number,
  check_number_null,

  check_integer,
  check_integer_null,

  check_bigint_u,
  check_bigint_u_null,
  check_bigint_u_array,
  check_bigint_u_array_null,

  check_bigint_u_no0,
  check_bigint_u_no0_null,

  check_string,
  check_string_null,
  check_string_size,
  check_string_size_null,
  check_string_range,
  check_string_range_null,

  check_string_date,
  check_string_date_null,

  check_phone,
  check_phone_null,

  check_in,
  check_in_null,

  check_isEnum,
  check_isEnum_null,
  check_isEnumArray,
  check_isEnumArray_null,

  check_array,
  check_array_null,
  check_object,

  err_locale,
};


// 返回 true/false/undefined
function get_boolean(p: any) { if ('false' === p || false === p || 0 == p) return false; if ('true' === p || true === p || 1 == p) return true; return undefined; }

/**
* @desc: 判断是否是登录状态
*/
function check_login(ctx: koa.Context):Msg { if (!ctx.real_session.user_id) return { err_code: errorCode.UNAUTHORIZE }; else return null; }

/**
* @desc 如果参数不是指定类型则返回errCode.PARAMS,返回返回null.
*/
function check_boolean(data: any, ...args: string[]):Msg  { for (var i = 0; i < args.length; i++) { let rrr = get_boolean(data[args[i]]); if (undefined === rrr) { return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})};  }  data[args[i]] = rrr; } return null; }
function check_boolean_null(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { let rrr = get_boolean(data[args[i]]); if (data[args[i]] && undefined === rrr) { return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } data[args[i]] = rrr; } return null; }
function check_number(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if ((!data[args[i]] || !isNumber(data[args[i]])) && data[args[i]] !== 0) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }
function check_number_null(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!data[args[i]]) continue; if ((!data[args[i]] || !isNumber(data[args[i]])) && data[args[i]] !== 0) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }
function check_integer(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!Number.isInteger(data[args[i]])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }
function check_integer_null(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!data[args[i]]) continue; if (!Number.isInteger(data[args[i]])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }
function check_bigint_u(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!febs.utils.bigint_check(data[args[i]]) || febs.utils.bigint_less_than(data[args[i]], 0)) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }
function check_bigint_u_null(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!data[args[i]]) continue; if (!febs.utils.bigint_check(data[args[i]]) || febs.utils.bigint_less_than(data[args[i]], 0)) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }


function check_bigint_u_array(data: any, ...args: string[]):Msg {
  for (var i = 0; i < args.length; i++) {
    if (!Array.isArray(data[args[i]])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})};
    let xx = data[args[i]];
    for (var j = 0; j < xx.length; j++) {
      if (check_bigint_u({v:xx[j]}, 'v')) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})};
    }
  }
  return null;
}


function check_bigint_u_array_null(data: any, ...args: string[]):Msg {
  for (var i = 0; i < args.length; i++) {
    if (data[args[i]]) {
      if (!Array.isArray(data[args[i]])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})};
      let xx = data[args[i]];
      for (var j = 0; j < xx.length; j++) {
        if (check_bigint_u_null({v:xx[j]}, 'v')) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})};
      }
    }
  }
  return null;
}

// 大于0.
function check_bigint_u_no0(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!febs.utils.bigint_check(data[args[i]]) || febs.utils.bigint_less_than_e(data[args[i]], 0)) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }
function check_bigint_u_no0_null(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!data[args[i]]) continue; if (!febs.utils.bigint_check(data[args[i]]) || febs.utils.bigint_less_than_e(data[args[i]], 0)) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }

/**
* @desc: 字符串
*/
function check_string(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (febs.string.isEmpty(data[args[i]])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }
function check_string_null(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!data[args[i]]) continue; if (febs.string.isEmpty(data[args[i]])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }
function check_string_size(data: any, str: any, size: number):Msg { if (size == 0) { if ((typeof data[str] === 'string') && data[str].length == 0) return null; if (data[str] === null || data[str] === undefined) return null; } if (febs.string.isEmpty(data[str]) || data[str].length != size) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:str})}; return null; }
function check_string_size_null(data: any, str: any, size: number):Msg { if (!data[str]) return null; if (size == 0) { if ((typeof data[str] === 'string') && data[str].length == 0) return null; if (data[str] === null || data[str] === undefined) return null; } if (febs.string.isEmpty(data[str]) || data[str].length != size) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:str})}; return null; }
// @param min,max: min为null则表示str.length == max; 否则则为范围.
function check_string_range(data: any, str: any, min: number, max = Number.MAX_SAFE_INTEGER):Msg { min = min || 0; max = max || Number.MAX_SAFE_INTEGER; if (min == 0) { if ((typeof data[str] === 'string') && data[str].length == 0) return null; if (data[str] === null || data[str] === undefined) return null; } if (febs.string.isEmpty(data[str]) || data[str].length < min || data[str].length > max) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:str})}; return null; }
function check_string_range_null(data: any, str: any, min: number, max = Number.MAX_SAFE_INTEGER):Msg { if (!data[str]) return null; min = min || 0; max = max || Number.MAX_SAFE_INTEGER; if (min == 0) { if ((typeof data[str] === 'string') && data[str].length == 0) return null; if (data[str] === null || data[str] === undefined) return null; } if (febs.string.isEmpty(data[str]) || data[str].length < min || data[str].length > max) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:str})}; return null; }

function check_phone(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!febs.string.isPhoneMobile(data[args[i]])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }
function check_phone_null(data: any, ...args: string[]):Msg { for (var i = 0; i < args.length; i++) { if (!data[args[i]]) continue; if (!febs.string.isPhoneMobile(data[args[i]])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})}; } return null; }

//--------------------------------------------------------
// ext.
//--------------------------------------------------------


function check_string_date(params:any, ...keys:string[]):Msg { 
  for (var i = 0; i < keys.length; i++) {
    var nn = params[keys[i]];
    if (!nn) {
      return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:keys[i]})};
    }

    if (nn.length == 10) {
      if (!Regex_date1.test(nn)) {
        return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:keys[i]})};
      }
    }
    else if (nn.length == 12) {
      if (!Regex_date2.test(nn)) {
        return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:keys[i]})};
      }
    }
    else if (nn.length == 14) {
      if (!Regex_date3.test(nn)) {
        return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:keys[i]})};
      }
    }
    else if (nn.length == 17) {
      if (!Regex_date4.test(nn)) {
        return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:keys[i]})};
      }
    }
    else {
      return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:keys[i]})};
    }
  }
  return null;
}
function check_string_date_null(params:any, ...keys:string[]):Msg { 
  for (var i = 0; i < keys.length; i++) { 
    if (!params[keys[i]]) continue;
    if (check_string_date(params, keys[i])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:keys[i]})};
  }
  return null;
}

// 在args中.
function check_in(params:any, key:string, ...values:any[]):Msg { let i;  for (i = 0; i < values.length; i++) { if (params[key] === values[i]) break; } if (i < values.length) return null; return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:key})}; }
function check_in_null(params:any, key:string, ...values:any[]):Msg { if (params[key] === null || params[key] === undefined) return null; let i; for (i = 0; i < values.length; i++) { if (params[key] === values[i]) break; } if (i < values.length) return null; return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:key})}; }

function check_isEnum(params:any, key:string, enumType:any):Msg {
  for (const key1 in enumType) {
    if (params[key] == enumType[key1]) {
      return null;
    }
  }
  return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:key})};
}
function check_isEnum_null(params:any, key:string, enumType:any):Msg {
  if (params[key] === null || params[key] === undefined)  return null;
  return check_isEnum(params, key, enumType);
}

function check_isEnumArray(params:any, key:string, enumType:any):Msg {
  let o = params[key];
  if ( !Array.isArray(o) ) { 
    return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:key})}; 
  }

  for (var i = 0; i < o.length; i++) {
    let x = {} as any; x[key] = o[i];
    let r = check_isEnum(x, key, enumType);
    if (r) return r;
  }
  return null;
}
function check_isEnumArray_null(params:any, key:string, enumType:any):Msg { 
  let o = params[key];
  if (!o) return null;
  return check_isEnumArray(params, key, enumType);
}


function check_array(data: any, ...args: string[]):Msg {
  for (var i = 0; i < args.length; i++) {
    if (!Array.isArray(data[args[i]])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})};
  }
  return null;
}
function check_array_null(params:any, ...keys:string[]):Msg { 
  for (var i = 0; i < keys.length; i++) { 
    if (!params[keys[i]]) continue;
    if (check_array(params, keys[i])) return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:keys[i]})};
  }
  return null;
}

function check_object(data: any, ...args: string[]):Msg {
  for (var i = 0; i < args.length; i++) {
    if (typeof (data[args[i]]) !== 'object') return {err_code:errorCode.PARAMETER_ERROR, err_msg: __i18n(err_locale, {arg:args[i]})};
  }
  return null;
}