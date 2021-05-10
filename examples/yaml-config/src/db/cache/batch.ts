'use strict';

/**
* Copyright (c) 2019 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-08-05 20:36
* Desc: 批量操作.
*/



import * as IORedis from 'ioredis';
import logger from '../../common/libs/logger';


/**
* @desc: 批量执行能够提高50~500%的效率
* @return: 
*/
export class CacheBatch {

  redis_ttl:number;
  redis:IORedis.Pipeline;
  TTL_tolerance:number;

  /**
  * @desc: 连接数据库. (会进行自动重连)
  */
  constructor(redisPipeline:IORedis.Pipeline, redis_ttl:number, TTL_tolerance:number) {
    this.redis = redisPipeline;
    this.redis_ttl = redis_ttl;
    this.TTL_tolerance = TTL_tolerance;
  }


  /**
  * @desc: 设置指定键的超时时间.
  * @param ttl: 秒数; 不指定, 则使用默认的值.
  */
  expire(key:string, ttl?:number, callback?:(err:Error,res:any)=>void): CacheBatch {
    this.redis.expire(key, ttl?ttl:(this.redis_ttl + Math.floor(Math.random() * this.TTL_tolerance)), callback);
    return this;
  }

  /**
  * @desc: 移除指定key的ttl.
  */
  persist(key:string, callback?:(err:Error,res:any)=>void):CacheBatch {
    this.redis.persist(key, callback);
    return this;
  }

  //#region hash操作
  
  /**
  * @desc: 设置hash表数据.
  *         不会设置默认ttl; ttl设置在hash表上.
  * @param key: 设置的键.
  * @param field: 设置的字段.
  * @param value: 设置的值.
  */
  hset(key:string, field:string, value:any, callback?:(err:Error,res:any)=>void):CacheBatch {
    this.redis.hset(key, field, value, callback);
    return this;
  }

  /**
  * @desc: 获取hash表指定的数据.
  */
  hget(key:string, field:string, callback?:(err:Error,res:any)=>void):CacheBatch {
    this.redis.hget(key, field, callback);
    return this;
  }

  /**
  * @desc: 获取hash表的keys.
  */
  hkeys(key:string, callback?:(err:Error,res:any)=>void):CacheBatch {
    this.redis.hkeys(key, callback);
    return this;
  }

  /**
  * @desc: 清理hash表指定的数据.
  */
  hdel(key:string, ...fields:string[]):CacheBatch {
    this.redis.hdel(key, ...fields);
    return this;
  };

  //#endregion

  //#region 集合操作

  /**
  * @desc: 在集合中插入值.
  */
  sadd(key:string, value:string):CacheBatch{
    this.redis.sadd(key, value);
    return this;
  }

  /**
  * @desc: 在集合中移除指定成员.
  */
  sremove(key:string, ...values:string[]):CacheBatch {
    this.redis.srem(key, ...values);
    return this;
  }

  /**
  * @desc: 返回集合中的元素个数.
  */
  scard(key:string, callback?:(err:Error,res:any)=>void):CacheBatch {
    this.redis.scard(key, callback);
    return this;
  }

  /**
  * @desc: 判读是否是集合中的元素.
  */
  sismember(key:string, value:string, callback?:(err:Error,res:any)=>void):CacheBatch {
    this.redis.sismember(key, value, callback);
    return this;
  }

  /**
  * @desc: 返回集合中的所有成员.
  */
  smembers(key:string, callback?:(err:Error,res:any)=>void):CacheBatch {
    this.redis.smembers(key, callback);
    return this;
  }

  //#endregion

  //#region string 操作

  /**
  * @desc: 设置数据, 会设置默认ttl.
  * @param key: 设置的键.
  * @param value: 设置的值.
  * @param ttl: ttl in second, 如果指定0,则使用默认值. -1则不设置.
  */
  set(key:string, value:any, ttl?:number, callback?:(err:Error,res:any)=>void):CacheBatch {
    ttl = ttl || this.redis_ttl + Math.floor(Math.random() * this.TTL_tolerance);
    if (ttl == -1) {
      this.redis.set(key, value, callback);
    }
    else {
      this.redis.set(key, value, 'EX', ttl, callback);
    }
    return this;
  }

  /**
  * @desc: 获取指定的数据.
  */
  get(key:string, callback?:(err:Error,res:any)=>void):CacheBatch {
    this.redis.get(key, callback);
    return this;
  };

  /**
  * @desc: 清理指定的数据.
  */
  del(key:string):CacheBatch {
    this.redis.del(key);
    return this;
  };

  //#endregion


  //#region 执行.

  /**
  * @desc: 执行所有语句, 并以数组方式返回所有结果.
  * @return: 
  */
  async exec(callback?:(err:Error,res:any[])=>void): Promise<any[]> {
    return await this.redis.exec(callback);
  }

  //#endregion
};