'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCloudConfig = exports.getCloudConfig = exports.initSpringCloudConfig = void 0;
const febs = require("febs");
const cloudConfig = require("cloud-config-client");
const mq = require("../mq");
const process_1 = require("process");
const logger_1 = require("../logger");
const busId_1 = require("./busId");
const utils_1 = require("../utils");
const mq_1 = require("../../types/mq");
const LOG_TAG = '[SpringCloudConfig] ';
const configSym = Symbol('configSym');
function initSpringCloudConfig(cfg) {
    return __awaiter(this, void 0, void 0, function* () {
        let { yamlConfig, cbRefresh } = cfg;
        logger_1.getLogger().info(LOG_TAG, 'initialling...');
        let cfg1 = {
            endpoint: yamlConfig['spring.cloud.config.uri'],
            name: yamlConfig['spring.application'],
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
        let config = yield fetchConfig(cfg1);
        if (config == null) {
            process.exit(0);
        }
        {
            config = febs.utils.mergeMap(yamlConfig, config);
            setCloudConfig(config);
        }
        logger_1.getLogger().debug(LOG_TAG, 'new config\r\n' + JSON.stringify(config, null, 2));
        if (!febs.string.isEmpty(config[cfg.springCloudBusConfigurePrefix + '.host'])) {
            let rabbitName = config[cfg.springCloudBusConfigurePrefix + '.username'];
            let rabbitPwd = config[cfg.springCloudBusConfigurePrefix + '.password'];
            let rabbitHost = config[cfg.springCloudBusConfigurePrefix + '.host'];
            let rabbitPort = config[cfg.springCloudBusConfigurePrefix + '.port'];
            let rabbitVirtualHost = config[cfg.springCloudBusConfigurePrefix + '.virtual-host'] || '/';
            if (rabbitVirtualHost[0] != '/') {
                rabbitVirtualHost = '/' + rabbitVirtualHost;
            }
            let configMQConn = yield mq.rabbitmq.subscribe({
                url: `amqp://${rabbitName}:${rabbitPwd}@${rabbitHost}:${rabbitPort}${rabbitVirtualHost}`,
                exchangeCfg: {
                    autoDelete: false,
                    exchangeName: 'springCloudBus',
                    exchangeType: mq_1.rabbitmq.ExchangeType.topic,
                },
                queueCfg: {
                    queuePattern: '#',
                    queueName: 'springCloudBus.anonymous.' + febs.crypt.uuid(),
                    autoDelete: true,
                    exclusive: true,
                }
            });
            function fetchMsg(cbRefresh1) {
                mq.rabbitmq.consumeMessage(configMQConn, (e, msg) => {
                    try {
                        let objMsg = JSON.parse(msg);
                        if (objMsg.type != 'RefreshRemoteApplicationEvent') {
                            let serviceName = busId_1.getBusIdServiceName(getCloudConfig());
                            if (objMsg.destinationService == '**'
                                || objMsg.destinationService == serviceName + ':**'
                                || objMsg.destinationService == busId_1.getBusId(getCloudConfig)) {
                                process_1.nextTick(() => {
                                    fetchMsg(cbRefresh1);
                                });
                            }
                            return;
                        }
                    }
                    catch (e) {
                        logger_1.getLogger().debug(LOG_TAG, utils_1.getErrorMessage(e));
                        process_1.nextTick(() => {
                            fetchMsg(cbRefresh1);
                        });
                        return;
                    }
                    logger_1.getLogger().debug(LOG_TAG, msg);
                    fetchConfig(cfg1).then(res => {
                        let config1 = global[configSym];
                        setCloudConfig(res);
                        let changeCfg = {};
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
                        logger_1.getLogger().debug(LOG_TAG, '\r\nchanged config:\r\n'
                            + JSON.stringify(changeCfg, null, 2)
                            + '\r\nnew config:\r\n'
                            + JSON.stringify(res, null, 2));
                        try {
                            cbRefresh1(changeCfg, res);
                        }
                        catch (e) {
                            logger_1.getLogger().error(e);
                        }
                    }).catch(e => {
                        logger_1.getLogger().error(e);
                    }).finally(() => {
                        process_1.nextTick(() => {
                            fetchMsg(cbRefresh1);
                        });
                    });
                });
            }
            process_1.nextTick(() => {
                fetchMsg(cbRefresh);
            });
        }
    });
}
exports.initSpringCloudConfig = initSpringCloudConfig;
function getCloudConfig() {
    return global[configSym];
}
exports.getCloudConfig = getCloudConfig;
function setCloudConfig(config) {
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
    global[configSym] = tmpCfg;
    return tmpCfg;
}
exports.setCloudConfig = setCloudConfig;
function fetchConfig(yamlConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let retry = yamlConfig._cfgRetry;
        let interval = retry["initial-interval"] || 0;
        for (let i = 0; i < (retry["max-attempts"] || 0) + 1; i++) {
            try {
                let cfg = yield cloudConfig.load(yamlConfig);
                return cfg._properties;
            }
            catch (e) {
                if (i + 1 < (retry["max-attempts"] || 0)) {
                    interval *= (retry["multiplier"] || 1);
                    if (interval > (retry['max-interval'] || Number.MAX_SAFE_INTEGER)) {
                        interval = (retry['max-interval']);
                    }
                    logger_1.getLogger().info(LOG_TAG, 'RETRY: will to connect config center');
                    logger_1.getLogger().debug(LOG_TAG, utils_1.getErrorMessage(e));
                    yield febs.utils.sleep(interval);
                    continue;
                }
                logger_1.getLogger().error(e);
                return null;
            }
        }
    });
}
//# sourceMappingURL=springCloudConfig.js.map