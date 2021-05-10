'use strict';

/**
* Copyright (c) 2019 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-08-05 21:39
* Desc: 
*/

import Redlock from 'redlock';
import * as IORedis from 'ioredis';
import runtimeException from '@/common/exceptions/runtimeException';

/**
* @desc: 分布式锁, 使用redlock. 需要3,5,7...台实例.
*/
export class CacheLock {

  redlock: Redlock|Redlock.Lock;

  constructor(redis: IORedis.Redis|IORedis.Redis[]|Redlock.Lock) {
    if (redis instanceof Redlock.Lock) {
      this.redlock = redis;
    }
    else {
      let rr = Array.isArray(redis)? redis: [redis];
      this.redlock = new Redlock(rr, {
        // the expected clock drift; for more details
        // see http://redis.io/topics/distlock
        driftFactor: 0.01, // time in ms

        // the max number of times Redlock will attempt
        // to lock a resource before erroring
        retryCount: 10,

        // the time in ms between attempts
        retryDelay: 200, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 200 // time in ms
      });
    }
  }

  /**
  * @desc: 释放锁.
  */
  async unlock():Promise<void> {
    if (this.redlock instanceof Redlock.Lock) {
      return await this.redlock.unlock();
    }
    else {
      throw new runtimeException('error call cache unlock', __filename, __line, __column);
    }
  }

  /**
  * @desc: 增加持有锁的时间.
  * @param ttl: ms.
  */
  async extendTTL(ttl:number):Promise<CacheLock> {
    if (this.redlock instanceof Redlock.Lock) {
      return await this.redlock.extend(ttl).then((res:Redlock.Lock)=>{
        return new CacheLock(res);
      });
    }
    else {
      throw new runtimeException('error call cache extendTTL', __filename, __line, __column);
    }
  }

  /**
  * @desc: 获得锁.
  * @param resource: 对此字符串进行加锁
  * @param maxTTL2Lock: 最多在此ms时间内保持锁.
  * @return: 
  */
  async _lock(resource:string, maxTTL2Lock:number):Promise<CacheLock> {
    if (this.redlock instanceof Redlock) {
      return await this.redlock.lock(resource, maxTTL2Lock).then((res:Redlock.Lock)=>{
        return new CacheLock(res);
      });
    }
    else {
      throw new runtimeException('error call cache lock', __filename, __line, __column);
    }
  }
}