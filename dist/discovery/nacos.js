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
exports.getNacosService = exports.initNacosNamingClient = void 0;
const febs = require("febs");
const logger_1 = require("../logger");
const InstanceRegisteredEvent_1 = require("../decorators/events/InstanceRegisteredEvent");
const os = require('os');
const NacosNamingClient = require('nacos').NacosNamingClient;
const NacosNamingClientInstance = Symbol('NacosNamingClientInstance');
const LOG_TAG = '[nacos] ';
function initNacosNamingClient(cfg) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, logger_1.getLogger)().info(LOG_TAG, 'initialling...');
        global.NacosNamingClientInstance = null;
        const logger = {
            info() {
            },
            debug() {
            },
            warn(...args) {
                let msg = '';
                if (typeof args[0] === 'object') {
                    msg = args[0];
                }
                else {
                    for (let i = 0; args.length; i++) {
                        msg += args[i];
                    }
                }
                (0, logger_1.getLogger)().warn(msg);
            },
            error(...args) {
                let msg = '';
                if (typeof args[0] === 'object') {
                    msg = args[0];
                }
                else {
                    for (let i = 0; args.length; i++) {
                        msg += args[i];
                    }
                }
                (0, logger_1.getLogger)().error(msg);
            }
        };
        const client = new NacosNamingClient({
            logger: logger,
            serverList: cfg.serverList,
            namespace: cfg.namespace,
            ssl: cfg.ssl,
        });
        yield client.ready();
        (0, logger_1.getLogger)().info(LOG_TAG, 'init finish');
        let ip = cfg.registerInfo.ip;
        if (!ip) {
            ip = getIPAdress();
        }
        yield client.registerInstance(cfg.registerInfo.serviceName, {
            ip: ip,
            port: cfg.registerInfo.port,
            weight: cfg.registerInfo.weight,
            metadata: cfg.registerInfo.metadata,
        });
        (0, logger_1.getLogger)().info(LOG_TAG, `register finish ${cfg.registerInfo.serviceName}(${ip + ':' + cfg.registerInfo.port})`);
        global.NacosNamingClientInstance = client;
        yield febs.utils.sleep(1500);
        yield (0, InstanceRegisteredEvent_1._callInstanceRegisteredEvent)({});
    });
}
exports.initNacosNamingClient = initNacosNamingClient;
function getNacosService(serviceName) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = global.NacosNamingClientInstance;
        if (!client) {
            Promise.reject(new Error(LOG_TAG + 'nacos client instance is unregistered'));
        }
        let hosts = yield client.getAllInstances(serviceName);
        if (hosts) {
            let hostss = [];
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
    });
}
exports.getNacosService = getNacosService;
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
//# sourceMappingURL=nacos.js.map