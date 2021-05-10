'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2018-11-16
* Desc: redis操作.
*/


import * as febs from 'febs';
import * as IORedis from 'ioredis';
import logger from '../../common/libs/logger';
import { CacheTransaction } from './transaction';
import { CacheBatch } from './batch';
import { CacheLock } from './lock';
import { database } from '@/db/base';
import { DBTransaction } from './db_transaction';

const TTL_tolerance = 10; // ttl时间增加这个抖动范围.
export const TTL_default = 60 * 5; // 默认5分钟.


/**
* @desc: 
*   1. 批量语句.
*         cache.batch()
               .set(...)
               .get(...)
               .exec((err, res)=>{});
*   2. 事务语句.
*         cache.multi()
               .set(...)
               .get(...)
               .exec((err, res)=>{});
            or .discard();
*/
export class Cache {

  private redis_ttl:number;
  private redis:IORedis.Redis|IORedis.Cluster;
  private cfg:any;

  

  /**
  * @desc: 连接数据库. (会进行自动重连)
  */
  constructor(cfg: {
    host?: string,
    port?: number,
    clusterServers?: { host: string, port: number }[],  // 使用cluster方式.
    db: number,
    password: string,
    ttl: number, // 秒. (默认的过期时间对hash表无效, hash需单独设置)
  }) {
    let ttl = cfg.ttl || TTL_default;
    this.cfg = febs.utils.mergeMap(cfg, {ttl, reconnectOnError:()=>1})
  }

  /**
  * @desc: connect
  */
  async connect():Promise<void> {

    let useCluster = false;

    let connectInfo = '';
    if (this.cfg.host) {
      connectInfo = this.cfg.host + ':' + this.cfg.port;
    }
    else {
      useCluster = true;
      this.cfg.clusterServers.forEach((element:any) => {
        connectInfo += `${element.host}:${element.port},`;
      });
    }

    return new Promise((resolve:any, reject:any)=>{
      this.dispose()
        .then((res:any) => {
          this.redis_ttl = this.cfg.ttl;
          if (useCluster) {
            this.redis = new IORedis.Cluster(this.cfg.clusterServers, {scaleReads:'slave', ...this.cfg});
          }
          else {
            this.redis = new IORedis(this.cfg);
          }
          this.redis.on('error', (e) => {
            logger.error('[Redis error]: ' + logger.getErrorMsg(e));
          });

          let on_connect = ()=>{
            logger.info('[Redis connected]: ' + `${connectInfo}`);
          }
          this.redis.once('connect', ()=>{
            on_connect();
            resolve();
            this.redis.on('connect', on_connect);
          });
          this.redis.on('reconnecting', ()=>{
            logger.warn('[Redis reconnect]: ' + `${connectInfo}`);
          });
        });
    });
  }

  // constructor(redisPipeline:IORedis.Pipeline) {

  // }

  /**
  * @desc: 退出redis连接.
  */
  async dispose():Promise<string> {
    if (this.redis) {
      return this.redis.quit();
    } else {
      return new Promise((resolve, reject) => { resolve(); });
    }
  }

  /**
  * @desc: 设置指定键的超时时间.
  * @param ttl: 秒数; 不指定, 则使用默认的值.
  */
  async expire(key:string, ttl?:number):Promise<boolean> {
    let tolerance = Math.floor(Math.random() * TTL_tolerance);

    return this.masterNode.expire(key, ttl?ttl:(this.redis_ttl + tolerance))
    .then(res=>{
      return !!res;
    })
  }

  /**
  * @desc: 移除指定key的ttl.
  */
  async persist(key:string):Promise<boolean> {
    return this.masterNode.persist(key)
    .then(res=>{
      return true;
    })
    .catch(e=>{
      return false;
    });
  }
  
  /**
  * @desc: 获取指定key的剩余过期时间 (秒).
  * @return: 
  */
  async ttl(key:string):Promise<number> {
    return await this.masterNode.ttl(key);
  }

  /**
  * @desc: 列出匹配的keys.
  */
  async keys(pattern:string):Promise<string[]> {
    return this.masterNode.keys(pattern);
  }

  //#region hash操作
  
  /**
  * @desc: 设置hash表数据.
  *         不会设置默认ttl; ttl设置在hash表上.
  * @param key: 设置的键.
  * @param field: 设置的字段.
  * @param value: 设置的值.
  * @return 
  *    表明是否成功设置.
  * 
  *    redis
  *     1 if field is a new field in the hash and value was set.
  *     0 if field already exists in the hash and the value was updated.
  */
  async hset(key:string, field:string, value:any):Promise<boolean> {
    return this.masterNode.hset(key, field, value)
      .then((res:any) => {
        return true;
      })
      .catch(e=>{
        return false;
      });
  }

  /**
  * @desc: 获取hash表指定的数据.
  */
  async hget(key:string, field:string):Promise<string> {
    return this.slaveNode.hget(key, field);
  };

  /**
  * @desc: 获取hash表的keys.
  */
  async hkeys(key:string):Promise<string[]> {
    return this.slaveNode.hkeys(key);
  }

  /**
  * @desc: 清理hash表指定的数据.
  */
  async hdel(key:string, ...fields:string[]):Promise<any> {
    return this.masterNode.hdel(key, ...fields);
  };

  /**
  * @desc: 指定的额feild是否存在.
  */
  async hexists(key:string, field:string):Promise<boolean> {
    return this.slaveNode.hexists(key, field).then(res=>!!res);
  }

  //#endregion

  //#region 集合操作

  /**
  * @desc: 在集合中插入值.
  */
  async sadd(key:string, value:string):Promise<any> {
    return this.masterNode.sadd(key, value);
  }

  /**
  * @desc: 在集合中移除指定成员.
  */
  async sremove(key:string, ...values:string[]):Promise<any> {
    return this.masterNode.srem(key, ...values);
  }

  /**
  * @desc: 返回集合中的元素个数.
  */
  async scard(key:string):Promise<number> {
    return this.slaveNode.scard(key);
  }

  /**
  * @desc: 判读是否是集合中的元素.
  */
  async sismember(key:string, value:string):Promise<boolean> {
    return this.slaveNode.sismember(key, value).then(res=>!!res);
  }

  /**
  * @desc: 返回集合中的所有成员.
  */
  async smembers(key:string):Promise<any> {
    return this.slaveNode.smembers(key);
  }

  //#endregion

  //#region string 操作

  /**
  * @desc: 设置数据, 会设置默认ttl.
  * @param key: 设置的键.
  * @param value: 设置的值.
  * @param ttl: ttl in second, 如果指定0,则使用默认值. -1则不设置.
  */
  async set(key:string, value:any, ttl:number = 0):Promise<boolean> {
    ttl = ttl || this.redis_ttl + Math.floor(Math.random() * TTL_tolerance);
    if (ttl == -1) {
      return this.masterNode.set(key, value).then(res=>!!res);
    }
    else {
      return this.masterNode.set(key, value, 'EX', ttl).then(res=>!!res);
    }
  }

  /**
  * @desc: 获取指定的数据.
  */
  async get(key:string):Promise<string> {
    return this.slaveNode.get(key);
  };

  /**
  * @desc: 清理指定的数据.
  */
  async del(key:string):Promise<any> {
    return this.masterNode.del(key);
  };

  /**
  * @desc: key是否存在.
  */
  async exists(key:string):Promise<boolean> {
    return this.slaveNode.exists(key).then(res=>!!res);
  }

  //#endregion


  //#region 事务.

  /**
  * @desc: 开始事务.
  *   cache.multi()
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  */
  multi(): CacheTransaction {
    return new CacheTransaction(this.masterNode.multi(), this.redis_ttl, TTL_tolerance);
  }



  /**
  * @desc: (数据库必须是事务中的) 获得数据库中使用的redis事务.
  *   cache.db_multi(db)
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  */
  db_get_multi_trans(db:database.database): CacheTransaction {
    return (db.transactionCustomData as DBTransaction).transaction
  }

  /**
  * @desc: (数据库必须是事务中的) 使用数据库中的附带消息开始事务.
  *   cache.db_multi(db)
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  */
  db_multi(db:database.database): void {
    if (!db.transactionCustomData) {
      let trans = new DBTransaction(new CacheTransaction(this.masterNode.multi(), this.redis_ttl, TTL_tolerance), this.redis);
      db.transactionCustomData = trans.multi();
    }
    else {
      let dbt = (db.transactionCustomData as DBTransaction);
      dbt.multi();
    }
  }

  /**
  * @desc: (数据库必须是事务中的) 执行所有语句.
  */
  async db_exec(db:database.database): Promise<boolean> {
    if (db.transactionCustomData) {
      let dbt = (db.transactionCustomData as DBTransaction);
      let r = !!(await dbt.exec());
      if (dbt.deep == 0) {
        db.transactionCustomData = null;
      }
      return r;
    }
    else {
      return new Promise((resolve, reject)=>{
        return true;
      })
    }
  }

  /**
  * @desc: (数据库必须是事务中的) 撤销所有语句.
  */
  db_discard(db:database.database): void {
    if (db.transactionCustomData) {
      let dbt = (db.transactionCustomData as DBTransaction);
      db.transactionCustomData = null;
      dbt.discard();
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

  //#endregion



  //#region 批量处理.

  /**
  * @desc: 开始事务.
  *   cache.batch()
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  */
  batch(): CacheBatch {
    return new CacheBatch(this.masterNode.pipeline(), this.redis_ttl, TTL_tolerance);
  }

  //#endregion


  private get masterNode() {
    if (this.redis instanceof IORedis.Cluster) {
      let nodes = this.redis.nodes('master');
      return nodes[(Math.floor(Math.random()*nodes.length))%nodes.length];
    }
    else {
      return this.redis;
    }
  }

  private get slaveNode() {
    if (this.redis instanceof IORedis.Cluster) {
      let nodes = this.redis.nodes('slave');
      return nodes[(Math.floor(Math.random()*nodes.length))%nodes.length];
    }
    else {
      return this.redis;
    }
  }
};