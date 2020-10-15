'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: tian
* Date: 2017-12-05
* Desc: 连接池
*/

var gp = require('generic-pool');
var amqp = require('amqplib');
var febs = require('febs');


function MqPool() {

}

// url:mq地址
MqPool.prototype.init = function (url) {
    if (this._pool) {
        return;
    }
    let opts = {
        max: 10,    // maximum size of the pool
        min: 4      // minimum size of the pool
    }
  
    this._pool = gp.createPool({
        create: function () {
            return new Promise(function (resolve, reject) {
                let client = null;
                try {
                    amqp.connect(url)
                        .then(conn => {
                            client = {};
                            client.conn = conn;
                            conn.on('error', (err) => {
                                client.conn = null;
                            });
                            return conn.createChannel();
                        })
                        .then(ch => {
                            client.ch = ch;
                            resolve(client);
                        })
                        .catch(err => {
                            resolve(null);
                        });
                }
                catch (ex) {
                    resolve(null);
                }
            });
        },
        destroy: function (client) {
            return new Promise(function (resolve, reject) {
                if (client) {
                    delete client.ch;
                    if (client.conn) {
                        client.conn.close();
                        delete client.conn;
                    }
                }
                resolve();
            })
        }
    }, opts);
}

MqPool.prototype.publish = async function (exchange, routingKey, content, opts) {
    let client = null;
    try {
        client = await this._pool.acquire();
        if (!client) {
          return null;
        }

        let r = await client.ch.publish(exchange, routingKey, content, opts);
        this._pool.release(client);
        return r;
    }
    catch (ex) {
        if (client) {
          try {
            this._pool.destroy(client);
          } catch (e) {}
        }

        return false;
    }
}

MqPool.prototype.sendToQueue = async function (queue, content, opts) {
    let client = null;
    try {
        client = await this._pool.acquire();
        if (!client) {
          return null;
        }
        
        let r = await client.ch.sendToQueue(queue, content, opts);
        this._pool.release(client);
        return r;
    }
    catch (ex) {
        if (client) {
          try {
            this._pool.destroy(client);
          } catch (e) {}
        }
        return false;
    }
}


module.exports = MqPool;