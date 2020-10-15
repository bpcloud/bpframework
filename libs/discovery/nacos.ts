'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-22 13:44
* Desc: 
*/

import * as febs from 'febs';
import { getLogger } from '../logger';
import { ServiceInfo } from '../../types/Application';
const os = require('os');
const NacosNamingClient = require('nacos').NacosNamingClient;
const NacosNamingClientInstance = Symbol('NacosNamingClientInstance');

const LOG_TAG = '[nacos] '

/**
* @desc: 初始化nacos naming 客户端.
* @return: 
*/
export async function initNacosNamingClient(cfg: {
  /** server1,server2 */
  serverList: string,
  ssl?: boolean,
  namespace: string,
  /** 注册信息 */
  registerInfo: {
    /* 注册到注册中心的名称 */
    serviceName: string,
    /** 注册到注册中心的ip */
    ip: string,
    /** 注册到注册中心的port */
    port: string,
    /** 服务权重 */
    weight?: number,
    /** 元数据 */
    metadata?: any,
  },
}) {
  getLogger().info(LOG_TAG, 'initialling...');
  (global as any).NacosNamingClientInstance = null;

  const logger = {
    info() {
    },
    debug() {
    },
    warn(...args: any[]) {
      let msg: any = '';
      if (typeof args[0] === 'object') {
        msg = args[0];
      }
      else {
        for (let i = 0; args.length; i++) {
          msg += args[i];
        }
      }
      getLogger().warn(msg);
    },
    error(...args: any[]) {
      let msg: any = '';
      if (typeof args[0] === 'object') {
        msg = args[0];
      }
      else {
        for (let i = 0; args.length; i++) {
          msg += args[i];
        }
      }
      getLogger().error(msg);
    }
  }

  const client = new NacosNamingClient({
    logger: logger,
    serverList: cfg.serverList,
    namespace: cfg.namespace,
    ssl: cfg.ssl,
  });

  await client.ready();
  getLogger().info(LOG_TAG, 'init finish');

  let ip = cfg.registerInfo.ip;
  if (!ip) {
    ip = getIPAdress();
  }
  
  // registry instance.
  await client.registerInstance(cfg.registerInfo.serviceName, {
    ip: ip,
    port: cfg.registerInfo.port,
    weight: cfg.registerInfo.weight,
    metadata: cfg.registerInfo.metadata,
  });
  getLogger().info(LOG_TAG, `register finish ${cfg.registerInfo.serviceName}(${ip+':'+cfg.registerInfo.port})`);

  (global as any).NacosNamingClientInstance = client;

  // Wait for a while
  await febs.utils.sleep(1500);
}

/**
 * 寻找一个服务的主机列表.
 * @param serviceName 
 */
export async function getNacosService(serviceName: string): Promise<ServiceInfo[]> {
  let client = (global as any).NacosNamingClientInstance;
  if (!client) {
    return Promise.resolve(null);
  }

  let hosts: any = await client.getAllInstances(serviceName);
  if (hosts) {
    let hostss = [] as any;
    for (let i = 0; i < hosts.length; i++) {
      if (hosts[i].valid && hosts[i].healthy && hosts[i].enabled) {
        hostss.push({
          ip: hosts[i].ip,
          port: hosts[i].port,
          weight: hosts[i].weight,
          metadata: hosts[i].metadata,
          serviceName: serviceName
        });
      }
    }
    if (hostss.length > 0) {
      return hostss;
    }
  }

  return Promise.reject(new Error(LOG_TAG + 'cannot find service ' + serviceName));
}

function getIPAdress() {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
      var iface = interfaces[devName];
      for (var i = 0; i < iface.length; i++) {
          var alias = iface[i];
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
              return alias.address;
          }
      }
  }
}