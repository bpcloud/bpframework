'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-22 14:29
* Desc: 读取 bootstrap.yml文件
*/

import * as fs from 'fs';
import * as YAML from 'yaml';

/**
* @desc: 获取正确的配置信息; 如果是 ${xxx} 形式则读取环境变量.
* @return: 
*/
function getConfig(cfg: any) {
  if (typeof cfg === 'string') {
    if (/^\$\{.*\}$/.test(cfg)) {
      return process.env[cfg.substr(2, cfg.length - 3)];
    } else {
      return cfg;
    }
  }
  else {
    return cfg;
  }
}

/**
* @desc: 读取bootstrap.yml文件信息
* @return: 
*/
export function readYamlConfig(configPath:string) {
  const file = fs.readFileSync(configPath, 'utf8')
  const yamlConfig = YAML.parseAllDocuments(file);

  
  let cfg0 = yamlConfig[0].toJSON();
  let cc = [cfg0];
  let config = [cfg0];

  if (yamlConfig.length > 1) {
    let active = cfg0.spring.profiles.active;
    active = active.split(',');
    
    for (let i = 0; i < active.length; i++) {
      active[i] = active[i].trim();
    }

    for (let i = 1; i < yamlConfig.length; i++) {
      let cfg = yamlConfig[i].toJSON();
      if (active.indexOf(cfg.spring.profiles) >= 0) {
        cfg.spring.application = cfg0.spring.application;
        cc.push(cfg);
        config.push(cfg);
      }
    }
  }

  // env.
  for (let i = 0; i < cc.length; i++) {
    for (let k in cc[i]) {
      let type = typeof cc[i][k];
      if (type === 'string') {
        cc[i][k] = getConfig(cc[i][k]);
      }
      else if (type == 'object') {
        cc.push(cc[i][k]);
      }
    } // for..in.
  } // for.

  // margin local.
  let localCfg = {} as any;
  let cc1 = [] as any;
  for (let key in config) {
    for (const key2 in config[key]) {
      cc1.push({ key:key2, value: config[key][key2] });
    }
  }
  for (let i = 0; i < cc1.length; i++) {
    let type = typeof cc1[i].value;
    if (type !== 'object') {
      localCfg[cc1[i].key] = cc1[i].value;
    } else {
      for (let kk in cc1[i].value) {
        cc1.push({ key: cc1[i].key+'.'+kk, value: cc1[i].value[kk] });
      }
    }
  }

  return localCfg;
}
