'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2017-10-30
* Desc: 订阅发布. 多个队列所有订阅者都能接收到消息.
*/

import * as qs   from 'querystring';
import * as amqp from 'amqplib';
import * as febs  from 'febs';
import { getErrorMessage } from '../../utils';

export enum ExchangeType {
  direct = 'direct',
  topic = 'topic',
  headers = 'headers',
  fanout = 'fanout',
}

export interface SubscribeConnect {
  /** 关闭订阅 */
  close(): void;

  _conn: amqp.Connection;
  _ch: amqp.Channel;
  _q: string;
}

/**
* @desc: 订阅连接消息队列.
* @return: Promise
*/
export async function init(opt: {
  /** 连接地址: amqp://xxxxx */
  url: string,
  exchange: string,
  exchangeType: ExchangeType,
  /** 心跳秒数: 10 */
  heartbeat?: number,
  /** 重连的毫秒数: 10000 */
  reconnect?: number,
  /** 如果指定空队列名称, 将创建一个随机队列 */
  queue?: string,
  /** topic, routing key 等. */
  queuePattern?: string,

  /** exchange 配置 */
  exchangeCfg?: {
    durable?: boolean,
    autoDelete?: boolean,
  }
}): Promise<SubscribeConnect> {
  
  let conn = {
    close: function () {
      if (this._conn) {
        this._conn.close();
      }
    }
  } as SubscribeConnect;
  opt.reconnect = opt.reconnect || 10000;
  opt.heartbeat = opt.heartbeat || 10;
  opt.exchangeCfg = opt.exchangeCfg || {};

  // params.
  let param = qs.stringify({
    'heartbeat' : opt.heartbeat,
  });

  await connect(opt, param, conn);
  return conn;
}

/**
 * 获取一个消息.
 * @param conn 
 */
export function consumeMessage(conn: SubscribeConnect, cb: (err: Error, msg: string) => void): void;
export function consumeMessage(conn: SubscribeConnect): Promise<string>;
export function consumeMessage(...args: any[]) {
  if (args.length > 1) {
    let conn = args[0];
    let cb = args[1];
    conn._ch.prefetch(1);
    conn._ch.consume(conn._q, function (msg: any) {
      if (msg && msg.content) {
        cb(null, msg.content.toString('utf8'));
      }
    }, { noAck: true })
      .then(() => {
      })
      .catch((e: Error) => {
        cb(e, null);
      });
  }
  else {
    let conn = args[0];
    conn._ch.prefetch(1);
    return new Promise((resolve, reject) => {
      conn._ch.consume(conn._q, function (msg:any) {
        if (msg && msg.content) {
          resolve(msg.content.toString('utf8'));
        }
      }, { noAck: true })
        .then(() => {
        })
        .catch((e: Error) => {
          reject(e);
        });
    })
  }
}

async function connect(opt: any, param: any, _conn: SubscribeConnect) {
  
  _conn._ch = null;
  _conn._q = null;
  _conn._conn = null;

  while (true) {
    try {
      // 1. connect to server and channel.
      let conn = await amqp.connect(opt.url + '?' + param);

      process.once('SIGINT', () => {
        conn.on('error', (err:any) => { });
        conn.close();
        conn = null;
      });

      // create channel.
      let ch = await conn.createChannel();

      // 2. assert exchange.
      await ch.assertExchange(opt.exchange, opt.exchangeType, {
        durable: opt.exchangeCfg.durable,
        autoDelete: opt.exchangeCfg.autoDelete
      });

      // 3. bind queue.
      let q = await ch.assertQueue(opt.queue || '', {
        exclusive: true,
      });

      await ch.bindQueue(q.queue, opt.exchange, opt.queuePattern || '');

      conn.on('error', (err:any) => {
        console.error('[rabbitmq] subscribe error: ' + getErrorMessage(err));
        setTimeout(() => {
          connect(opt, param, _conn).then(() => { });
        }, opt.reconnect);
      });
      
      _conn._ch = ch;
      _conn._q = q.queue;
      _conn._conn = conn;
      return _conn;
    }
    catch (e) {
      console.error('[rabbitmq] reconnect: ' + opt.url + '\r\n' + getErrorMessage(e));
      await febs.utils.sleep(opt.reconnect);
    }
  } // while.
}
