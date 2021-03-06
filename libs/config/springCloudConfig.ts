'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-19 11:28
* Desc: 
*

--------------------------
- usage -
--------------------------

// 初始化配置中心.
await initSpringCloudConfig((changeCfg:any, allCfg:any)=>{
  // 配置动态刷新时的回调方法.
  // ...
});

// 后续可使用此方法获取配置.
let config = getCloudConfig();

--------------------------
- bootstrap.yml example: -
--------------------------

spring:
  application:
    name: mall
  profiles:
    active: dev

---
spring:
  profiles: dev
  cloud:
    config:
      uri: ${BPFAAS11_CONFIG_CENTER_URI}
      label: dev
      profile: dev
      retry:
        max-attempts: 6        # 配置重试次数，默认为6
        multiplier: 1.1        # 间隔乘数 默认1.1
        initial-interval: 1000 # 初始重试间隔时间，默认1000ms
        max-interval: 2000     # 最大间隔时间，默认2000ms
      token: ${BPFAAS_CONFIG_TOKEN_BASE_SERVICE} # 针对不用应用使用不同权限token.
*/

import * as febs from 'febs';
import * as cloudConfig from 'cloud-config-client';

import * as mq from '../mq';
import { nextTick } from 'process';
import { getLogger } from '../logger';
import { ImmutableConfigMap } from '../../types/struct.d';
import { getBusId, getBusIdServiceName } from './busId';
import { getErrorMessage } from '../utils';
import { ExchangeType } from '../mq/rabbitmq/enum';

const LOG_TAG = '[SpringCloudConfig] '
const configSym = Symbol('configSym');

export {
  initSpringCloudConfig,
  getCloudConfig,
  setCloudConfig,
}

/**
* @desc: 初始化spring cloud config.
* @param cbRefresh 配置刷新时的回调. 
*                 changeCfg 参数为存在改变的配置.
*                 如果是配置项被删除则changeCfg中相应的key对应的value为null.
*/
async function initSpringCloudConfig(
  cfg: {
    springCloudBusConfigurePrefix: string,
    yamlConfig: any,
    cbRefresh: (changedCfg: ImmutableConfigMap, allCfg: ImmutableConfigMap) => void,
  }) {
  
  let { yamlConfig, cbRefresh } = cfg;
  
  getLogger().info(LOG_TAG, 'initialling...');
  
  let cfg1 = {
    endpoint: yamlConfig['spring.cloud.config.uri'],
    name: yamlConfig['spring.application.name'],
    profiles: yamlConfig['spring.cloud.config.profile'],
    label: yamlConfig['spring.cloud.config.label'],
    headers: { 'X-Config-Token': yamlConfig['spring.cloud.config.token'], },
    _cfgRetry: {
      'initial-interval': yamlConfig['spring.cloud.config.retry.initial-interval'],
      'max-attempts': yamlConfig['spring.cloud.config.retry.max-attempts'],
      'max-interval': yamlConfig['spring.cloud.config.retry.max-interval'],
      'multiplier': yamlConfig['spring.cloud.config.retry.multiplier'],
    }
  };

  let config = await fetchConfig(cfg1);
  if (config == null) {
    process.exit(0);
  }

  // margin local.
  getLogger().debug(LOG_TAG, 'new config\r\n' + JSON.stringify(config, null, 2));
  {
    let config1 = (global as any)[configSym];
    config = febs.utils.mergeMap(yamlConfig, config);
    setCloudConfig(config);

    let changeCfg = {} as any;
    for (let k in config) {
      if (config1[k] != config[k]) {
        changeCfg[k] = config[k];
      }
    }
    for (let k in config1) {
      if (!config.hasOwnProperty(k)) {
        changeCfg[k] = null;
      }
    }

    cbRefresh(changeCfg, config);
  }
  
  //
  // 监听动态刷新.
  if (!febs.string.isEmpty(config[cfg.springCloudBusConfigurePrefix + '.host'])) {

    let rabbitName = config[cfg.springCloudBusConfigurePrefix + '.username'];
    let rabbitPwd = config[cfg.springCloudBusConfigurePrefix + '.password'];
    let rabbitHost = config[cfg.springCloudBusConfigurePrefix + '.host'];
    let rabbitPort = config[cfg.springCloudBusConfigurePrefix + '.port'];
    let rabbitVirtualHost = config[cfg.springCloudBusConfigurePrefix + '.virtual-host'] || '/';
    if (rabbitVirtualHost[0] != '/') {
      rabbitVirtualHost = '/' + rabbitVirtualHost;
    }
    
    let configMQConn = await mq.rabbitmq.subscribe({
      url: `amqp://${rabbitName}:${rabbitPwd}@${rabbitHost}:${rabbitPort}${rabbitVirtualHost}`,
      exchangeCfg: {
        autoDelete: false,
        exchangeName: 'springCloudBus',
        exchangeType: ExchangeType.topic,
      },
      queueCfg: {
        queuePattern: '#',
        queueName: 'springCloudBus.anonymous.' + febs.crypt.uuid(),
        autoDelete: true,
        exclusive: true,
        arguments: {"x-queue-master-locator": 'client-local'}
      }
    });

    getLogger().info("[CloudConfig] subscribe to: " + `amqp://${rabbitName}:${rabbitPwd}@${rabbitHost}:${rabbitPort}${rabbitVirtualHost}`);

    function fetchMsg(cbRefresh1: (newCfg: any, oldCfg: any) => void) {
      mq.rabbitmq.consumeMessage(configMQConn, (e: Error, msg: string) => {

        try {
          let objMsg = JSON.parse(msg);
          if (objMsg.type != 'RefreshRemoteApplicationEvent') {

            let serviceName = getBusIdServiceName(getCloudConfig());
            if (objMsg.destinationService == '**'
              || objMsg.destinationService == serviceName + ':**'
              || objMsg.destinationService == getBusId(getCloudConfig)) {

              nextTick(() => {
                fetchMsg(cbRefresh1);
              });
            }
            return;
          }
        } catch (e) {
          getLogger().debug(LOG_TAG, getErrorMessage(e));
          nextTick(() => {
            fetchMsg(cbRefresh1);
          });
          return;
        }
        getLogger().debug(LOG_TAG, msg);

        fetchConfig(cfg1).then(res => {
          let config1 = (global as any)[configSym];
          setCloudConfig(res)
          
          let changeCfg = {} as any;
          for (let k in res) {
            if (config1[k] != res[k]) {
              changeCfg[k] = res[k];
            }
          }
          for (let k in config1) {
            if (!res.hasOwnProperty(k)) {
              changeCfg[k] = null;
            }
          }
          getLogger().debug(LOG_TAG, '\r\nchanged config:\r\n'
            + JSON.stringify(changeCfg, null, 2)
            + '\r\nnew config:\r\n'
            + JSON.stringify(res, null, 2));
          
          try {
            cbRefresh1(changeCfg, res);
          } catch (e) { getLogger().error(e); }
        }).catch(e => {
          getLogger().error(e);
        }).finally(() => {
          nextTick(() => {
            fetchMsg(cbRefresh1);
          });
        })
      });
    }

    nextTick(() => {
      fetchMsg(cbRefresh);
    });
  } // if.
}


/**
* @desc: 获取spring配置信息.
* @example
*   可以按照如下两种方式获取配置:
*   1. 按完整路径方式获取配置
*       getCloudConfig()['spring.cloud.config.uri'] 
*   2. 按照健值方式获取配置
*       getCloudConfig().spring.cloud.config.uri
*/
function getCloudConfig(): ImmutableConfigMap {
  return (global as any)[configSym];
}
/**
* @desc: 设置spring配置信息.
*/
function setCloudConfig(config: ImmutableConfigMap): ImmutableConfigMap  {
  
  let tmpCfg = {} as any;
  let tmpCfgNotDot = {} as any;

  for (const key in config) {
    if (key.indexOf('.') >= 0) {
      tmpCfg[key] = config[key];
    }
    else {
      tmpCfgNotDot[key] = config[key];
    }
  }

  // 满足两种方式取值.
  for (const key in tmpCfg) {
    let keys = key.split('.');
    let tmpKey = '';
    let tmpVal: any = tmpCfgNotDot;
    let tmpValPreIsArray: any = null;

    for (let i = 0; i < keys.length; i++) {
    
      if (tmpKey.length > 0) tmpKey += '.';
      let singleKey = keys[i];

      tmpKey += singleKey;

      let nn:string = singleKey;
      let isArray = /.*\[\d+\]$/.test(singleKey);
      let arrayIndex;
      if (isArray) {
        nn = singleKey.substring(0, singleKey.lastIndexOf('['));
        arrayIndex = parseInt(singleKey.substring(singleKey.lastIndexOf('[') + 1, singleKey.length - 1));

        if (tmpValPreIsArray) {
          tmpVal = tmpValPreIsArray.v[tmpValPreIsArray.arrayIndex] = [];
        }
        tmpValPreIsArray = null;

        if (!tmpVal[nn]) {
          tmpVal[nn] = [];
        }
      }
      
      
      if (tmpCfg.hasOwnProperty(tmpKey) && i == keys.length-1) {
        if (isArray) {
          tmpVal = tmpVal[nn][arrayIndex] = tmpCfg[tmpKey];
        }
        else {
          tmpVal = tmpVal[nn] = tmpCfg[tmpKey];
        }
      } else {
        if (isArray) {
          if (!tmpVal[nn][arrayIndex]) {
            tmpValPreIsArray = {v: tmpVal[nn], arrayIndex};
            tmpVal = tmpVal[nn][arrayIndex] = {};
          }
          else {
            tmpVal = tmpVal[nn][arrayIndex];
          }
        }
        else {
          if (typeof tmpVal[nn] !== 'object') {
            tmpVal = tmpVal[nn] = {};
          } else {
            tmpVal = tmpVal[nn];
          }
        }
      }
    }
  } // for.

  for (const key in tmpCfgNotDot) {
    let singleKey = key;
    let isArray = /.*\[\d+\]$/.test(singleKey);
    if (isArray) {
      let nn = singleKey.substring(0, singleKey.lastIndexOf('['));
      let arrayIndex = parseInt(singleKey.substring(singleKey.lastIndexOf('[') + 1, singleKey.length - 1));
      if (tmpCfgNotDot[nn]) {
        tmpCfgNotDot[nn][arrayIndex] = tmpCfgNotDot[key];
      }
    }
    
    tmpCfg[key] = tmpCfgNotDot[key];
  }

  // seal, freeze.
  let objArr = [] as any[];
  for (const key in tmpCfg) {
    if (typeof tmpCfg[key] === 'object') {
      objArr.push(tmpCfg[key]);
    }
  }

  for (let i = 0; i < objArr.length; i++) {
    for (const key in objArr[i]) {
      if (typeof objArr[i][key] !== 'object') {
        Object.defineProperty(objArr[i], key, {
          value: objArr[i][key],
          writable: false,
          enumerable: true,
          configurable: true
        });
      } else {
        objArr.push(objArr[i][key]);
      }
    }
  }
  for (let i = 0; i < objArr.length; i++) {
    Object.seal(objArr[i]);
    Object.freeze(objArr[i]);
  }

  Object.seal(tmpCfg);
  Object.freeze(tmpCfg);

  (global as any)[configSym] = tmpCfg;

  return tmpCfg;
}

async function fetchConfig(yamlConfig:any) {
  let retry: {
    'max-attempts': number,
    'multiplier': number,
    'initial-interval': number,
    'max-interval': number,
  } = yamlConfig._cfgRetry;

  let interval = retry["initial-interval"] || 0;

  for (let i = 0; i < (retry["max-attempts"] || 0) + 1; i++) {
    try {
      let cfg = await cloudConfig.load(yamlConfig);
      return (cfg as any)._properties;
    }
    catch (e) {
      if (i + 1 < (retry["max-attempts"] || 0)) {
        interval *= (retry["multiplier"] || 1);
        if (interval > (retry['max-interval'] || Number.MAX_SAFE_INTEGER)) {
          interval = (retry['max-interval']);
        }
        getLogger().info(LOG_TAG, 'RETRY: will to connect config center');
        getLogger().debug(LOG_TAG, getErrorMessage(e));
        await febs.utils.sleep(interval);
        continue;
      }

      getLogger().error(e);
      return null;
    }
  }
}
