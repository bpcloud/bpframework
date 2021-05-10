'use strict';

/**
 * Copyright (c) 2017 Copyright tj All Rights Reserved.
 * Author: lipengxiang
 * Date: 2017-06-16
 * Desc: 定义数据表基类.
 */



import * as febs from 'febs';
import * as febsdb from 'febs-db';
import * as assert from 'assert';

import logger from '@/common/libs/logger';
import date from '@/common/libs/date';

import { Application } from 'bpframework';

import TableHelper from './tableHelper';
import dbtype from './type';
import {
  Cache,
  cacheKey
} from '../cache';

import ITableBase from './ITablebase';

import InSyncException from '@/common/exceptions/inSyncException';
import runtimeException from '@/common/exceptions/runtimeException';

/**
* @desc 获取配置.
*/
function getAppConfig(): ServerConfig {
  return (Application.getConfig().application as ServerConfig);
}

// 正在数据库中查询的对象.
let cache_quering_map_s = Symbol('cache_quering_map');
if (!(<any>global)[cache_quering_map_s]) {
  (<any>global)[cache_quering_map_s] = new Map();
}
let cache_quering_map = (<any>global)[cache_quering_map_s];

// forbid 字段名称.
const ColForbid = 'is_forbid';
const ColDelete = 'is_delete';
const ColCreated_at = 'created_at';
const ColCreated_by = 'created_by';
const ColUpdated_at = 'updated_at';
const ColUpdated_by = 'updated_by';
const ColTickSelf = 'tick';


/**
* @desc: 使用 update, add, remove, setForbid 都已经处理了 created_by/created_at/updated_by/updated_at信息. 
* @param cfg: 如果使用缓存, 则只能使用 updateById, removeById 等语句进行单条数据更新.
*
*   如果下几个字段会在创建,更新,删除时自动处理; 无需进行操作 (除join语句)
*   1. (可自动创建) 默认使用is_delete:bit 字段来标记假删除.
*   2. (可自动创建) created_by, created_at, updated_by, updated_at 4个字段
          这4个字段会默认创建, 定义表结构时无需涉及.
*   3. is_forbid:bit 字段如果被指定; 则影响 isAvailable方法, 可以判断是否被禁用.
*   4. tick:BigInt 字段如果被指定; 每次修改会+1
*
* @summary 关于cache.
*   如果指定了cache, 则可以对数据进行cache缓存 (仅单主键支持cache). 
*   cache表将不支持如下的模糊匹配操作:
      - remove
      - update
*   如下的数据更新操作会清除指定id的cache:
      - removeById
      - updateById
      - setForbid
*   调用如下方法时会先从cache中获取数据, 如果缓存不存在则会从db中获取,并设置缓存. (cache会忽略查询的opt)
      - selectById
*   如下的方法将直接从cache里操作数据. 序列化方法使用 _serialize / _deserialize
      - clearCache
      - getCache
      - _setCache 外部不应该调用.
*
* @summary 不允许真删. 必须提供一个表明是否删除的字段.
*/
export default class TableBase extends febsdb.tablebase implements ITableBase {

  protected cacheTable: boolean;
  protected cacheDB: Cache;

  constructor(tablename: string, idKeyName: string | string[], model: object,
    cfg
      : {
        // @desc 是否缓存此表; 如果缓存, 将会在更新操作后同时清空cache. (默认false)
        cacheTable?: boolean,
        // @desc 用于进行cache操作的对象. (默认null)
        cacheDB?: Cache,
        // @desc 是否真删. (默认为false)
        realDel?: boolean,
      } = null
  ) {
    cfg = cfg || {
      cacheTable: false,
      cacheDB: null,
      realDel: false,
    };
    

    //
    // 创建默认字段.
    let cols: any = model;
    if (!cols[ColCreated_at]) {
      cols[ColCreated_at] = { type: febsdb.dataType.DateTime() };
    }
    if (!cols[ColCreated_by]) {
      cols[ColCreated_by] = { type: dbtype.ID };
    }
    if (!cols[ColUpdated_at]) {
      cols[ColUpdated_at] = { type: febsdb.dataType.DateTime() };
    }
    if (!cols[ColUpdated_by]) {
      cols[ColUpdated_by] = { type: dbtype.ID };
    }
    if (!cfg.realDel && !cols[ColDelete]) {
      cols[ColDelete] = { type: febsdb.dataType.Bit() };
    }
    if (cfg.realDel) {
      if (cols.hasOwnProperty(ColDelete)) {
        throw new runtimeException(`table ${tablename} real delete cannot have column ${ColDelete}`, __filename, __line, __column);
      }

      console.warn(`table ${tablename} use real delete`);
    }

    super(tablename, idKeyName, cols);

    this.cacheTable = cfg.cacheTable;
    this.cacheDB = cfg.cacheDB;

    assert(!(((!!this.cacheDB) as any) ^ ((!!this.cacheTable) as any)));

    if (this.cacheDB) {
      if (Array.isArray(idKeyName)) {
        throw new runtimeException('only single primary key support cache', __filename, __line, __column);
      }
    }
  }

  /**
   * @desc: 获取数据条数. is_delete=1的数据不参与查询.
   */
  async count(where?: string): Promise<number> {
    if (this.model.hasOwnProperty(ColDelete)) {
      if (!where || where.indexOf(' ' + ColDelete) < 0) {
        if (where)
          where += ' AND' + this.condition.equal(ColDelete, false);
        else
          where = this.condition.equal(ColDelete, false);
      }
    }

    return await super.count(where);
  }

  /**
   * @desc: 判断id是否存在, is_delete=1的数据不参与查询.
   */
  async exist(id: any): Promise<boolean> {

    // 查询缓存.
    if (this.cacheDB && this.cacheTable) {
      let item = await this._isExistCache(id);
      if (!!item) {
        return true;
      }
    }

    let condi = this.condition.equal(this.idKeyName, id);
    return (await this.count(condi)) > 0;
  }

  /**
   * @desc: 根据条件判断是否存在.
   */
  async existWhere(where: string): Promise<boolean> {
    return this.count(where).then(res => {
      return res > 0;
    })
  }

  /**
   * @desc: 查询; is_delete=1的数据不参与查询.
   */
  async select(where: string, opt?: febsdb.select_opt): Promise<Array<any>> {

    if (!opt) opt = {} as any;

    if (!opt.limit) {
      opt.limit = getAppConfig().pager.max_items_per_page;
    }

    if (this.model.hasOwnProperty(ColDelete)) {
      if (!where || where.indexOf(' ' + ColDelete) < 0) {
        if (where)
          where += ' AND' + this.condition.equal(ColDelete, false);
        else
          where = this.condition.equal(ColDelete, false);
      }
    }
    return await super.select(where, opt);
  }

  /**
   * @desc: 查询; is_delete=1的数据参与查询.
   */
  async select_containDel(where: string, opt?: febsdb.select_opt): Promise<Array<any>> {

    if (!opt) opt = {} as any;

    if (!opt.limit) {
      opt.limit = getAppConfig().pager.max_items_per_page;
    }
    
    return await super.select(where, opt);
  }

  /**
   * @desc: 通过id查询. is_delete=1的数据不参与查询.
   *        (优先在cache中查询.)
   * @exception: InSyncException
   */
  async selectById(id: any, cols?: Array<string>): Promise<any> {
    let item;

    let is_cache = false;

    let cache_key;

    // 查询缓存.
    if (this.cacheDB && this.cacheTable) {
      is_cache = true;
      item = await this.getCache(id);
      if (item) {
        let rReturn = true;
        // 查询item是否有opts所指定的所有数据.
        if (!cols) {
          for (const key in this.model) {
            if (!item.hasOwnProperty(key)) {
              rReturn = false;
              break;
            }
          }
        }
        else {
          for (const key in cols) {
            if (this.model.hasOwnProperty(key) && !item.hasOwnProperty(key)) {
              rReturn = false;
              break;
            }
          }
        } // if..else.

        if (rReturn) {
          return item;
        }
      }

      // 如果已经处于查询数据库状态.
      cache_key = cacheKey(this.tablename, id);
      if (cache_quering_map.has(cache_key)) {
        throw new InSyncException('quering cache', __filename, __line, __column);
      }

      // 标记.
      cache_quering_map.set(cache_key, true);
    }

    // 查询数据库.
    try {
      let condi = this.condition.equal(this.idKeyName, id);
      item = (await this.select(condi, {cols:cols}))[0];

      if (is_cache) {
        if (item)
          await this._setCache(id, item);
        else
          // warning.
          logger.db_warn(null, `query a empty cache: ${this.tablename}-${id}`);

        // 清除标记.
        cache_quering_map.delete(cache_key);
      }

      return item;
    }
    catch (e) {
      // 清除标记.
      cache_quering_map.delete(cache_key);

      logger.db_err(null, e);
      throw e;
    }
  }

  
  /**
   * @desc: select by id and lock row for update (use in transaction)
   *        is_delete=1的数据不参与查询.
   *        (优先在cache中查询.)
   * @exception: InSyncException
   */
  async selectLockRow(id: any, cols?: Array<string>): Promise<any> {
    // 查询数据库.
    try {
      let item = (await super.selectLockRow(id, cols));
      return item;
    }
    catch (e) {
      logger.db_err(null, e);
      throw e;
    }
  }

  /**
   * @desc: 查询第一个. is_delete=1的数据不参与查询.
   */
  async selectTop(where: string, opts?: febsdb.select_opt) /*: Promise < any >*/ {
    return (await this.select(where, febs.utils.mergeMap({
      limit: 1
    }, opts)))[0];
  }


  /**
   * @desc: 带日志模块. 禁用, 使用is_forbid字段标记. (带tick字段, tick字段自动设置为当前全表最大).
   *        (如果存在cache, 会更新cache)
   * @return: 
   */
  async setForbid(operator: ID, id: ID, forbid: boolean): Promise<boolean> {
    let r = false;
    try {
      if (this.model.hasOwnProperty(ColForbid)) {
        let mod: any = {};
        mod[ColForbid] = forbid;
        return await this.updateById(operator, id, mod);
      } else {
        logger.db_err(operator, `table ${this.tablename} haven't "${ColForbid}" col`);
      }
    } catch (err) {
      if (__debug) logger.db_err(operator, err);
      throw err;
    };

    return r;
  }

  /**
   * @desc: 是否有效.
   * @return: 
   */
  async isAvailable(id: ID, where?: string): Promise<{
    available: boolean, // 是否有效, 无效可能表示已经被删除.
    is_forbid?: boolean // 是否被禁止.
  }> {

    let cols = [];
    if (this.model.hasOwnProperty(ColDelete)) {
      cols.push(ColDelete);
    } else if (this.model.hasOwnProperty(ColForbid)) {
      cols.push(ColForbid);
    }

    let wheres = this.condition.equal(this.idKeyName, id);
    if (where) {
      wheres += 'AND (' + where + ')';
    }

    let r = await this.selectTop(wheres, {
      cols: cols
    });
    if (!r) {
      return {
        available: false
      };
    }

    let unavailable/*: boolean*/;
    if (this.model.hasOwnProperty(ColDelete)) {
      unavailable = unavailable || r[ColDelete];
    }
    if (!unavailable && this.model.hasOwnProperty(ColForbid)) {
      unavailable = r[ColForbid];
    }

    return {
      available: !unavailable,
      is_forbid: r[ColForbid]
    };
  }

  /**
   * @desc: 构造查询可用的条件语句. ' (xxx) '
   *        此语句中将添加 is_delete = false 的条件.
   * @return: string.
   */
  makeAvailableCondition(alias?: string) /*: string*/ {
    let where1 = '';
    if (this.model.hasOwnProperty(ColDelete)) {
      where1 += this.condition.equal(ColDelete, false, alias);
    }
    // if (this.model.hasOwnProperty(ColForbid)) {
    //   where1 += 'AND';
    //   where1 += this.condition.equal(ColForbid, false, alias);
    // }
    if (where1 == '')
      return ' (1) ';

    where1 = ' (' + where1 + ') ';
    return where1;
  }

  /**
  * @deprecated 弃用不带操作者信息的修改记录方法. 
  */
  async add(item: any): Promise<boolean>;
  /**
   * @desc: 带日志模块.
   *        自增主键如果是字符串型, 则使用 identify.nextId() 生成id.
   * @return: 
   */
  async add(operator : ID, item?: any): Promise<boolean>;
  async add(operator : ID, item?: any): Promise<boolean> {
    if (!item) {
      throw new runtimeException('db unsupported function: add', __filename, __line, __column);
    }

    let r;
    try {
      let now = new Date();
      if (this.model.hasOwnProperty(ColDelete)) item[ColDelete] = false;
      if (this.model.hasOwnProperty(ColUpdated_at)) item[ColUpdated_at] = now;
      if (this.model.hasOwnProperty(ColUpdated_by) && operator) item[ColUpdated_by] = operator;
      if (this.model.hasOwnProperty(ColCreated_at)) item[ColCreated_at] = now;
      if (this.model.hasOwnProperty(ColCreated_by) && operator) item[ColCreated_by] = operator;
      if (this.model.hasOwnProperty(ColTickSelf)) item[ColTickSelf] = 1;

      r = await super.add(item);
      if (r) {
        logger.db_add(operator, this.tablename, item);
      }

    } catch (err) {
      if (__debug) logger.db_err(operator, err);
      throw err;
    };

    return r;
  }


  /**
  * @deprecated 弃用不带操作者信息的修改记录方法. 
  */
  async update(item: any, where?: string): Promise<boolean>;
  /**
   * @desc: 带日志模块.
   *     tick字段 - 会自动设置为tick+1.
   * @summary
   *     如果此表为cache表, 则会清理缓存中的值.
   * @return: 
   */
  async update(operator: ID, item: any, where?: string) : Promise < boolean >;
  async update(operator: ID, item: any, where?: string) : Promise < boolean > {

    if (typeof item === 'string') {
      throw new runtimeException('db unsupported function: update', __filename, __line, __column);
    }

    let r;
    try {

      let keyArr = Object.getOwnPropertyNames(item);

      // 仅有主键.
      if (!Array.isArray(this.idKeyName)) {
        if (keyArr.length == 1 && keyArr[0] == this.idKeyName) {
          return true;
        }
      } else {
        if (keyArr.length == this.idKeyName.length) {
          let k = 0;
          for (; k < this.idKeyName.length; k++) {
            if (!item.hasOwnProperty(this.idKeyName[k])) {
              break;
            }
          }
          if (k >= this.idKeyName.length)
            return true;
        }
      }

      if (this.model.hasOwnProperty(ColUpdated_at)) item[ColUpdated_at] = new Date();
      if (this.model.hasOwnProperty(ColUpdated_by) && operator) item[ColUpdated_by] = operator;
      if (this.model.hasOwnProperty(ColTickSelf)) item[ColTickSelf] = this.condition.col_inc(1);

      // 构造可用语句.
      if (where) {
        where = this.makeAvailableCondition() + 'AND ' + where;
      }
      else {
        where = this.makeAvailableCondition();
      }

      r = await super.update(item, where);
      if (r) {
        // 清理缓存.
        if (this.cacheDB && this.cacheTable) {
          if (item[<string>this.idKeyName]) {
            await this.clearCache(item[<string>this.idKeyName]);
          }
        }

        logger.db_update(operator, this.tablename, where, item);
      }
    } catch (err) {
      if (__debug) logger.db_err(operator, err);
      throw err;
    }

    return r;
  }

  /**
   * @desc: 带日志模块.
   *     tick字段 - 会自动设置为tick+1.
   * @return: 
   */
  async updateById(operator: ID, id: ID, item: any, where?: string): Promise<boolean> {
    let r;
    try {

      let keyArr = Object.getOwnPropertyNames(item);

      // 仅有主键.
      if (!Array.isArray(this.idKeyName)) {
        if (keyArr.length == 1 && keyArr[0] == this.idKeyName) {
          return true;
        }
      } else {
        if (keyArr.length == this.idKeyName.length) {
          let k = 0;
          for (; k < this.idKeyName.length; k++) {
            if (!item.hasOwnProperty(this.idKeyName[k])) {
              break;
            }
          }
          if (k >= this.idKeyName.length)
            return true;
        }
      }

      if (this.model.hasOwnProperty(ColUpdated_at)) item[ColUpdated_at] = new Date();
      if (this.model.hasOwnProperty(ColUpdated_by) && operator) item[ColUpdated_by] = operator;
      if (this.model.hasOwnProperty(ColTickSelf)) item[ColTickSelf] = this.condition.col_inc(1);

      if (where) {
        where = '(' + where + ') AND ' + this.condition.equal(this.idKeyName, id) + 'AND' + this.makeAvailableCondition();
      } else {
        where = this.condition.equal(this.idKeyName, id) + 'AND' + this.makeAvailableCondition();
      }

      r = await super.update(item, where);
      if (r) {

        // 清理缓存.
        if (this.cacheDB && this.cacheTable) {
          await this.clearCache(id);
        }

        logger.db_update(operator, this.tablename, where, item);
      }
    } catch (err) {
      if (__debug) logger.db_err(operator, err);
      throw err;
    };

    return r;
  }

  /**
   * @desc: 使用tablebase原有的操作 (不会更新updated_at等字段).
   * @return: 
   */
  protected async _updateByIdSrc(id: ID, item: any, where?: string): Promise<boolean> {
    let r;
    try {

      let keyArr = Object.getOwnPropertyNames(item);

      // 仅有主键.
      if (!Array.isArray(this.idKeyName)) {
        if (keyArr.length == 1 && keyArr[0] == this.idKeyName) {
          return true;
        }
      } else {
        if (keyArr.length == this.idKeyName.length) {
          let k = 0;
          for (; k < this.idKeyName.length; k++) {
            if (!item.hasOwnProperty(this.idKeyName[k])) {
              break;
            }
          }
          if (k >= this.idKeyName.length)
            return true;
        }
      }

      if (where) {
        where = '(' + where + ') AND ' + this.condition.equal(this.idKeyName, id) + 'AND' + this.makeAvailableCondition();
      } else {
        where = this.condition.equal(this.idKeyName, id) + 'AND' + this.makeAvailableCondition();
      }

      r = await super.update(item, where);
      if (r) {

        // 清理缓存.
        if (this.cacheDB && this.cacheTable) {
          await this.clearCache(id);
        }

        logger.db_update(null, this.tablename, where, item);
      }
    } catch (err) {
      if (__debug) logger.db_err(null, err);
      throw err;
    }

    return r;
  }

  /**
  * @deprecated 弃用不带操作者信息的修改记录方法. 
  */
  async remove(where: string): Promise<boolean>;
  /**
   * @desc: 删除数据. 
   *        假删 设置 is_delete 字段 = true.
   * @warning: 
   *     如果使用了缓存, 不能使用此接口.
   */
  async remove(operator: ID, where?: string): Promise<boolean>;
  async remove(operator: ID, where?: string): Promise<boolean> {
    if (!where) {
      throw new runtimeException('db unsupported function: remove', __filename, __line, __column);
    }
    if (this.cacheDB) {
      throw new runtimeException('cache table can\'t call remove2', __filename, __line, __column);
    }
    if (febs.string.isEmpty(where)) {
      throw new runtimeException('remove must have condition', __filename, __line, __column);
    }

    let r = false;
    try {
      if (this.model.hasOwnProperty(ColDelete)) {
        let mod:any = {};
        mod[ColDelete] = true;

        if (this.model.hasOwnProperty(ColUpdated_at)) mod[ColUpdated_at] = new Date();
        if (this.model.hasOwnProperty(ColUpdated_by) && operator) mod[ColUpdated_by] = operator;
        if (this.model.hasOwnProperty(ColTickSelf)) mod[ColTickSelf] = this.condition.col_inc(1);

        where = '(' + where + ') AND' + this.makeAvailableCondition();
        r = await super.update(mod, where);
      }
      else {
        r = await super.remove(where);
      }

      if (r) {
        logger.db_remove(operator, this.tablename, where, false);
      }
    } catch (err) {
      if (__debug) logger.db_err(operator, err);
      throw err;
    };

    return r;
  }

  /**
   * @desc: 删除数据. 
   *        根据配置进行真删或假删除.
   *        (会进行cache操作.)
   */
  async removeById(operator: ID, id: any, where?: string): Promise<boolean> {
    let r = false;
    try {
      if (this.model.hasOwnProperty(ColDelete)) {
        let mod:any = {};
        mod[ColDelete] = true;

        if (this.model.hasOwnProperty(ColUpdated_at)) mod[ColUpdated_at] = new Date();
        if (this.model.hasOwnProperty(ColUpdated_by) && operator) mod[ColUpdated_by] = operator;
        if (this.model.hasOwnProperty(ColTickSelf)) mod[ColTickSelf] = this.condition.col_inc(1);

        if (where) {
          where = '(' + where + ') AND ' + this.condition.equal(this.idKeyName, id) + 'AND' + this.makeAvailableCondition();
        } else {
          where = this.condition.equal(this.idKeyName, id) + 'AND' + this.makeAvailableCondition();
        }

        r = await super.update(mod, where);
      }
      else {
        if (where) {
          where = '(' + where + ') AND ' + this.condition.equal(this.idKeyName, id);
        } else {
          where = this.condition.equal(this.idKeyName, id);
        }
        r = await super.remove(where);
      }

      if (r) {
        // 清理缓存.
        if (this.cacheDB && this.cacheTable) {
          await this.clearCache(id);
        }
        logger.db_remove(operator, this.tablename, where, false);
      }
    } catch (err) {
      if (__debug) logger.db_err(operator, err);
      throw err;
    };

    return r;
  }

  /**
   * @desc: 进行cache清理.
   */
  async clearCache(id: any) /*: Promise < void >*/ {
    if (this.cacheDB && this.cacheTable) {
      await this.cacheDB.hdel(this.tablename, id);
    }
  }


  /**
   * @desc: 进行cache设置. 外部不应该调用.
   */
  async _setCache(id: any, item: any)/*: Promise < void >*/ {
    if (this.cacheDB && this.cacheTable && item) {
      await this.cacheDB.hset(this.tablename, id, this._serialize(item));
    }
  }

  /**
   * @desc: 进行cache获取.
   */
  async getCache(id: any) /*: Promise < any >*/ {
    if (this.cacheDB && this.cacheTable) {
      let item = await this.cacheDB.hget(this.tablename, id);
      return this._deserialize(item);
    }

    return null;
  }

  /**
   * @desc: 是否存在.
   */
  async _isExistCache(id: any) /*: Promise < any >*/ {
    if (this.cacheDB && this.cacheTable) {
      return await this.cacheDB.hexists(this.tablename, id);
    }

    return null;
  }


  /**
   * @desc: 序列化.
   */
  _serialize(item: any) : string {
    let stringItem:any = {}
    for (const key in item) {
      const colDef = this.model[key];
      if (colDef) {
        if (item.hasOwnProperty(key)) {
          const element = item[key];
          if (colDef.type.type == febsdb.dataType.BigInt) {
            stringItem[key] = febs.utils.bigint_toFixed(element);
          } else if (colDef.type.type == febsdb.dataType.DateTime) {
            stringItem[key] = date.datetimeMS2utcstr(element);
          } else {
            stringItem[key] = element;
          }
        }
      } // if.
    }
    return JSON.stringify(stringItem);
  }

  /**
   * @desc: 反序列化.
   */
  _deserialize(stringItem : string): any {
    if (!stringItem)
      return null;
    try {
      let item = JSON.parse(stringItem);
      for (const key in item) {
        const colDef = this.model[key];
        if (item.hasOwnProperty(key)) {
          const element = item[key];
          if (colDef.type.type == febsdb.dataType.BigInt) {
            item[key] = febs.utils.bigint(element);
          } else if (colDef.type.type == febsdb.dataType.DateTime) {
            item[key] = date.utcstr2date(element);
          }
        }
      }
      return item;
    } catch (e) {
      return null;
    }
  }
}
