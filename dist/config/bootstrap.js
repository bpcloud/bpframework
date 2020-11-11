'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.readYamlConfigToObjectMap = exports.readYamlConfig = void 0;
const fs = require("fs");
const YAML = require("yaml");
function getConfig(cfg) {
    if (typeof cfg === 'string') {
        if (/^\$\{.*\}$/.test(cfg)) {
            return process.env[cfg.substr(2, cfg.length - 3)];
        }
        else {
            return cfg;
        }
    }
    else {
        return cfg;
    }
}
function readYamlConfig(configPath) {
    const file = fs.readFileSync(configPath, 'utf8');
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
    for (let i = 0; i < cc.length; i++) {
        for (let k in cc[i]) {
            let type = typeof cc[i][k];
            if (type === 'string') {
                cc[i][k] = getConfig(cc[i][k]);
            }
            else if (type == 'object') {
                cc.push(cc[i][k]);
            }
        }
    }
    let localCfg = {};
    let cc1 = [];
    for (let key in config) {
        for (const key2 in config[key]) {
            cc1.push({ key: key2, value: config[key][key2] });
        }
    }
    for (let i = 0; i < cc1.length; i++) {
        let type = typeof cc1[i].value;
        if (type !== 'object') {
            localCfg[cc1[i].key] = cc1[i].value;
        }
        else {
            for (let kk in cc1[i].value) {
                cc1.push({ key: cc1[i].key + '.' + kk, value: cc1[i].value[kk] });
            }
        }
    }
    return localCfg;
}
exports.readYamlConfig = readYamlConfig;
function readYamlConfigToObjectMap(configPath) {
    let config = readYamlConfig(configPath);
    let tmpCfg = {};
    let tmpCfgNotDot = {};
    for (const key in config) {
        if (key.indexOf('.') >= 0) {
            tmpCfg[key] = config[key];
        }
        else {
            tmpCfgNotDot[key] = config[key];
        }
    }
    for (const key in tmpCfg) {
        let keys = key.split('.');
        let tmpKey = '';
        let tmpValToRoot;
        let tmpVal;
        let tmpValPre;
        let tmpPreKey = '';
        for (let i = 0; i < keys.length; i++) {
            if (tmpKey.length > 0)
                tmpKey += '.';
            tmpKey += keys[i];
            let nn = parseInt(keys[i]);
            let bNum = false;
            if (Number.isInteger(nn) && nn == 0) {
                bNum = true;
            }
            else {
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
            }
            else {
                if (!tmpValToRoot) {
                    tmpVal = tmpCfgNotDot;
                    tmpValToRoot = tmpCfgNotDot;
                }
                tmpVal[keys[i]] = tmpVal[keys[i]] || (bNum ? [] : {});
                tmpValPre = tmpVal;
                tmpPreKey = keys[i];
                tmpVal = tmpVal[keys[i]];
            }
        }
    }
    for (const key in tmpCfgNotDot) {
        tmpCfg[key] = tmpCfgNotDot[key];
    }
    let objArr = [];
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
            }
            else {
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
exports.readYamlConfigToObjectMap = readYamlConfigToObjectMap;
//# sourceMappingURL=bootstrap.js.map