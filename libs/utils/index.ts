'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-01 15:56
* Desc: 
*/

/**
* @desc: 将值转换为boolean值.
* @return: 
*/
export function castBoolean(v: any) {
  return v === 'TRUE' || v === 'true' || v === true ? true : false;
}

/**
* @desc 获取error的文本.
*/
export function getErrorMessage(e: any) {
  if (e instanceof Error) {
    e = `${e.message}\n${e.stack}`;
  }
  else if (typeof e === 'object') {
    try {
      e = JSON.stringify(e);
    } catch (err) {
      e = 'LOG catch in JSON.stringify';
    }
  }
  else {
    e = (e ? e.toString() : '');
  }

  return e;
}