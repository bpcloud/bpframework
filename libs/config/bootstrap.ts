'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-10-22 14:29
* Desc: 读取 bootstrap.yml文件
*/

import * as febs from 'febs';
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
export function readYamlConfig(configPaths: string[]) {

  let localCfg = {} as any;
  let activeProfile;
  let application;
  
  for (let i0 = 0; i0 < configPaths.length; i0++) {
    let configPath = configPaths[i0];
    if (!febs.file.fileIsExist(configPath)) {
      continue;
    }
      
    const file = fs.readFileSync(configPath, 'utf8')
    const yamlConfig = YAML.parseAllDocuments(file);

  
    let cfg0 = yamlConfig[0].toJSON();
    let cc = [cfg0];
    let config = [cfg0];

    if (yamlConfig.length > 1) {
      if (!activeProfile) {
        activeProfile = cfg0.spring.profiles.active;
        if (!Array.isArray(activeProfile)) {
          activeProfile = activeProfile.split(',');
        }
        for (let i = 0; i < activeProfile.length; i++) {
          activeProfile[i] = activeProfile[i].trim();
        }

        if (!application) {
          application = cfg0.spring.application;
        }
      }
      
      for (let i = 1; i < yamlConfig.length; i++) {
        let cfg = yamlConfig[i].toJSON();
        if (cfg.spring && cfg.spring.profiles && activeProfile.indexOf(cfg.spring.profiles) >= 0) {
          cfg.spring.application = application;
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
    let cc1 = [] as any;
    for (let key in config) {
      for (const key2 in config[key]) {
        cc1.push({ key: key2, value: config[key][key2] });
      }
    }
    for (let i = 0; i < cc1.length; i++) {
      let type = typeof cc1[i].value;
      let kkey = cc1[i].key;
      let j = 0;
      while (0 <= (j = kkey.indexOf('-'))) {
        let tk = kkey.substring(0, j);
        if (kkey.length > j + 1) {
          tk += kkey[j + 1].toUpperCase() + kkey.substring(j + 2);
        }
        kkey = tk;
      }
      
      if (type !== 'object') {
        localCfg[kkey] = cc1[i].value;
      } else {
        if (Array.isArray(cc1[i].value)) {
          for (let kk in cc1[i].value) {
            cc1.push({ key: kkey + '[' + kk + ']', value: cc1[i].value[kk] });
          }
        }
        else {
          for (let kk in cc1[i].value) {
            cc1.push({ key: kkey + '.' + kk, value: cc1[i].value[kk] });
          }
        }
      }
    }
  }

  return localCfg;
}


/**
* @desc: 读取本地配置, 并分散为两种读取方式.
*/
export function readYamlConfigToObjectMap(configPath: string) {
  
  let config = readYamlConfig([configPath]);
  
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
    let tmpValToRoot: any;
    let tmpVal: any;
    let tmpValPre: any;
    let tmpPreKey = '';
    for (let i = 0; i < keys.length; i++) {
    
      if (tmpKey.length > 0) tmpKey += '.';
      tmpKey += keys[i];

      let nn:any = parseInt(keys[i]);
      let bNum = false;
      if (Number.isInteger(nn) && nn == 0) {
        bNum = true;
      } else {
        nn = keys[i];
      }
      
      if (tmpCfg.hasOwnProperty(tmpKey)) {
        if (!tmpValToRoot) {
          tmpVal = tmpCfgNotDot;
          tmpValToRoot = tmpCfgNotDot;
        }

        if (bNum) {
          tmpValPre[tmpPreKey] = [];
          tmpVal = tmpValPre[tmpPreKey];
        }

        tmpVal[nn] = tmpCfg[tmpKey];
      } else {
        if (!tmpValToRoot) {
          tmpVal = tmpCfgNotDot;
          tmpValToRoot = tmpCfgNotDot;
        }

        tmpVal[keys[i]] = tmpVal[keys[i]] || (bNum?[]:{});
        tmpValPre = tmpVal;
        tmpPreKey = keys[i];
        tmpVal = tmpVal[keys[i]];
      }
    }
  } // for.

  for (const key in tmpCfgNotDot) {
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

  return tmpCfg;
}