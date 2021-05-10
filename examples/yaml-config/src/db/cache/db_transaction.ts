'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2018-11-16
* Desc: .
*/


import * as febs from 'febs';
import * as IORedis from 'ioredis';
import logger from '../../common/libs/logger';
import { CacheTransaction } from './transaction';
import { CacheBatch } from './batch';
import { CacheLock } from './lock';
import runtimeException from '@/common/exceptions/runtimeException';

const TTL_tolerance = 10; // ttl时间增加这个抖动范围.
export const TTL_default = 60 * 5; // 默认5分钟.


/**
* @desc: 结合数据库的双事务操作
*/
export class DBTransaction {

  private trans:CacheTransaction;
  private deepNumber:number;
  private redis:IORedis.Redis|IORedis.Cluster;

  /**
  * @desc: 
  */
  constructor(trans:CacheTransaction, redis:IORedis.Redis|IORedis.Cluster) {
    this.trans = trans;
    this.deepNumber = 0;
    this.redis = redis;
  }

  get deep() {
    return this.deepNumber;
  }

  /**
  * @desc: 获得事务对象.
  */
  get transaction() {
    return this.trans;
  }

  //#region 事务.

  /**
  * @desc: 开始事务.
  *   cache.multi()
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  */
  multi(): DBTransaction {
    logger.db_debug(null, `redis: multi ${this.deepNumber}`);
    this.deepNumber++;
    return this;
  }

  /**
  * @desc: 执行所有语句, 并以数组方式返回所有结果.
  * @return: 
  */
  async exec(): Promise<any[]> {
    let deep = --this.deepNumber;
    logger.db_debug(null, `redis: exec ${deep}`);

    if (deep < 0) {
      throw new runtimeException('db&redis transaction', __filename, __line, __column);
    }
    
    if (deep == 0) {
      let r = await this.trans.exec();
      return r;
    }
    return new Promise((resolve, reject)=>{ resolve([]) });
  }

  discard(): void {
    let deep = --this.deepNumber;
    logger.db_debug(null, `redis: discard ${deep}`);

    if (deep < 0) {
      throw new runtimeException('db&redis transaction', __filename, __line, __column);
    }
    
    if (deep == 0) {
      this.trans.discard();
    }
  }
    /**
  * @desc: 获得分布式锁 (redlock).
  * @param resource: 对此字符串进行加锁
  * @param maxTTL2Lock: 最多在此ms时间内保持锁.
  * @return: 
  */
  async lock(resource:string, maxTTL2Lock:number):Promise<CacheLock> {
    if (this.redis instanceof IORedis.Cluster) {
      return await (new CacheLock(this.redis.nodes('master')))._lock(resource, maxTTL2Lock);
    }
    else {
      return await (new CacheLock(this.masterNode))._lock(resource, maxTTL2Lock);
    }
  }

  private get masterNode() {
    if (this.redis instanceof IORedis.Cluster) {
      let nodes = this.redis.nodes('master');
      return nodes[(Math.floor(Math.random()*nodes.length))%nodes.length];
    }
    else {
      return this.redis;
    }
  }

  //#endregion
};