'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2017-06-16
* Desc: 定义数据表基类.
*/



import logger from '@/common/libs/logger';


/**
* @desc:  
*/
export default class TableHelper {

  /**
   * @desc: 删除mod中的null数据. (不会删除0和false)
   */
  static deleteNullMember(mod:any) {
    if (mod) {
      for (const key in mod) {
        if (mod[key] === null) {
          delete mod[key];
        }
      }
    }
  }

  /**
  * @desc: 在msg中获取指定的cols, 如果存在则赋予mod, 并且从msg中删除.
  * @param modDest: 存储数据到此对象.
  * @param modSrc: 从此对象中获取数据.
  * @param cols: 字段字符串数组.
  */
  static copyMember(modDest:any, modSrc:any, ...cols:string[]) {
    for (let i = 0; i < cols.length; i++) {
      const element = cols[i];
      if (modSrc.hasOwnProperty(element)) { 
        modDest[element] = modSrc[element];
        delete modSrc[element];
      }
    }
  }

  
  /**
  * @desc: 对json, ["string","string","string"...] 形式数据进行解析;
  * @return: 失败返回null. 正确返回 json.
  */
  static deserializeJsonStrings(data: string): string[] | null {
    try {
      // if (!(data instanceof String)) throw 'data is not a string: ' + data;
      if (!data) return [];
      let r = JSON.parse(data);
      if (!Array.isArray(r)) return null;
      for (let i = 0; i < r.length; i++) {
        if (typeof r[i] !== 'string') {
          return null;
        }
      }
      return r;
    } catch (e) { logger.db_err(null, e.toString() + ' ' + __filename + '(' + __line + ':' + __column + ')'); return null; }
  }

  /**
  * @desc: 序列化 ["string","string","string"...]形式的数据.
  * @param strMaxLength: 数据库存储此字段的最大长度.
  * @param elemMaxLength: 允许的元素最大个数.
  * @return: 失败返回null, 正确返回 string.
  */
  static serializeJsonStrings(data: Array<string>, strMaxLength: number, elemMaxLength:number = Number.MAX_SAFE_INTEGER): string | null {
    if (!(Array.isArray(data)))
      return null;

    if (data.length > elemMaxLength)
      return null;
    
    try {
      var ret = JSON.stringify(data);
      if (ret.length > strMaxLength)
        return null;

      return ret;
    } catch (e) {
      logger.db_err(null, e.toString() + ' ' + __filename + '(' + __line + ':' + __column + ')');
      return null;
    }
  }
}
