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
exports.registerRefreshScopeBean = exports.Bean = exports.ImmediatelyService = exports.Service = exports.finishBeans_refreshScope = exports.finishBeans = exports.getServiceInstances = exports.pushGlobalWaitAutowiredClass = void 0;
require("reflect-metadata");
const febs = require("febs");
const logger_1 = require("../logger");
const objectUtils_1 = require("../utils/objectUtils");
const FinishAllBeanDelay = Symbol('FinishAllBeanDelay');
const ServiceWaitAutowiredInstance = Symbol('ServiceWaitAutowiredInstance');
const BeanWaitAutowiredInstance = Symbol('BeanWaitAutowiredInstance');
const BeanRefreshScopeAutowiredInstance = Symbol('BeanRefreshScopeAutowiredInstance');
const ServiceInstance = Symbol('ServiceInstance');
const AutowiredInstances = Symbol('AutowiredInstances');
const AutowiredInstancesName = Symbol('AutowiredInstancesName');
const AutowiredRefreshScopeInstances = Symbol('AutowiredRefreshScopeInstances');
function getGlobalRefreshScopeAutowiredBeans() {
    let instances = global[BeanRefreshScopeAutowiredInstance];
    if (!instances) {
        instances = [];
        global[BeanRefreshScopeAutowiredInstance] = instances;
    }
    return instances;
}
function getGlobalWaitAutowiredServices() {
    let instances = global[ServiceWaitAutowiredInstance];
    if (!instances) {
        instances = [];
        global[ServiceWaitAutowiredInstance] = instances;
    }
    return instances;
}
function getGlobalWaitAutowiredBeans() {
    let instances = global[BeanWaitAutowiredInstance];
    if (!instances) {
        instances = [];
        global[BeanWaitAutowiredInstance] = instances;
    }
    return instances;
}
function getGlobalServices() {
    let instances = global[ServiceInstance];
    if (!instances) {
        instances = {};
        global[ServiceInstance] = instances;
    }
    return instances;
}
function getGlobalWaitAutowiredClass() {
    return global[AutowiredInstances] = global[AutowiredInstances] || [];
}
function pushGlobalWaitAutowiredClass(cfg) {
    getGlobalWaitAutowiredClass().push(cfg);
}
exports.pushGlobalWaitAutowiredClass = pushGlobalWaitAutowiredClass;
function getGlobalWaitAutowireds_refreshScope() {
    return global[AutowiredRefreshScopeInstances] = global[AutowiredRefreshScopeInstances] || [];
}
function getServiceInstances(key) {
    let instances = getGlobalServices();
    return instances[key];
}
exports.getServiceInstances = getServiceInstances;
function finishBeans() {
    return __awaiter(this, void 0, void 0, function* () {
        if (global[FinishAllBeanDelay]) {
            return;
        }
        let instances = getGlobalServices();
        let waitBeans = getGlobalWaitAutowiredBeans();
        for (let i in waitBeans) {
            let { key, callback, singleton, target, propertyKey, refreshScope } = waitBeans[i];
            let __bpRefreshScopeInfo = target.__bpRefreshScopeInfo;
            if (!refreshScope) {
                if (__bpRefreshScopeInfo && __bpRefreshScopeInfo[propertyKey]) {
                    refreshScope = true;
                    waitBeans[i].refreshScope = true;
                    waitBeans[i].target = null;
                    waitBeans[i].propertyKey = null;
                }
            }
            if (singleton) {
                let res = yield callback();
                instances[key] = { singleton, instance: res };
                yield finishAutowired(key, !refreshScope);
            }
            else {
                instances[key] = {
                    singleton, callback
                };
                yield finishAutowired(key, !refreshScope);
            }
            (0, logger_1.getLogger)().debug('[Bean load] name: ', key);
        }
        waitBeans.length = 0;
        let waitServices = getGlobalWaitAutowiredServices();
        for (let i in waitServices) {
            let { key, target, singleton } = waitServices[i];
            if (singleton) {
                let instance = new target();
                instances[key] = { singleton, instance };
                yield finishAutowired(key, true);
            }
            else {
                let callback = () => __awaiter(this, void 0, void 0, function* () {
                    return new target();
                });
                instances[key] = {
                    singleton, callback
                };
                yield finishAutowired(key, true);
            }
            if (typeof key === 'string') {
                (0, logger_1.getLogger)().debug('[Service load] name: ', key);
            }
            else {
                (0, logger_1.getLogger)().debug('[Service load] class: ', objectUtils_1.default.getClassNameByClass(key));
            }
        }
        waitServices.length = 0;
        let autos = getGlobalWaitAutowiredClass();
        if (autos.length > 0) {
            throw new Error(`Autowired Cannot find Bean: '${autos[0].type}'`);
        }
        global[FinishAllBeanDelay] = true;
    });
}
exports.finishBeans = finishBeans;
function finishBeans_refreshScope() {
    return __awaiter(this, void 0, void 0, function* () {
        let instances = getGlobalServices();
        let waitBeans = getGlobalRefreshScopeAutowiredBeans();
        for (let i in waitBeans) {
            let { key, callback, singleton } = waitBeans[i];
            if (singleton) {
                let res = yield callback();
                instances[key] = { singleton, instance: res };
                yield finishAutowired_refreshScope(key);
            }
            else {
                instances[key] = {
                    singleton, callback
                };
                yield finishAutowired_refreshScope(key);
            }
            (0, logger_1.getLogger)().debug('[Bean reload] name: ', key);
        }
    });
}
exports.finishBeans_refreshScope = finishBeans_refreshScope;
function Service(...args) {
    let cfg;
    if (args.length == 0 || typeof args[0] !== 'string') {
        cfg = args[0] || {};
    }
    else {
        cfg = { name: args[0] };
    }
    cfg.singleton = cfg.hasOwnProperty('singleton') ? cfg.singleton : true;
    let { singleton, name } = cfg;
    return (target) => {
        let key = febs.string.isEmpty(name) ? target : name;
        if (target.__isServiced) {
            throw new Error(`@Service '${key}': It's already declared`);
        }
        target.__isServiced = true;
        let autowiredName = global[AutowiredInstancesName] = global[AutowiredInstancesName] || {};
        let cname = objectUtils_1.default.getClassNameByClass(target);
        if (autowiredName.hasOwnProperty(cname)) {
            throw new Error(`@Service '${cname}': It's already declared`);
        }
        autowiredName[cname] = true;
        if (typeof key === 'string' && key != cname) {
            if (autowiredName.hasOwnProperty(key)) {
                throw new Error(`@Service '${key}': It's already declared`);
            }
            autowiredName[key] = true;
        }
        let instances = getGlobalServices();
        if (instances.hasOwnProperty(key)) {
            throw new Error(`@Service '${key}': It's already declared`);
        }
        instances[key] = null;
        if (global[FinishAllBeanDelay]) {
            if (singleton) {
                let instance = new target();
                instances[key] = { singleton, instance };
                finishAutowired(key, true).then(() => { });
            }
            else {
                let callback = () => __awaiter(this, void 0, void 0, function* () {
                    return new target();
                });
                instances[key] = {
                    singleton, callback
                };
                finishAutowired(key, true).then(() => { });
            }
        }
        else {
            let waitInstances = getGlobalWaitAutowiredServices();
            waitInstances.push({
                key,
                target,
                singleton,
            });
        }
    };
}
exports.Service = Service;
function ImmediatelyService(...args) {
    let cfg;
    if (args.length == 0 || typeof args[0] !== 'string') {
        cfg = args[0] || {};
    }
    else {
        cfg = { name: args[0] };
    }
    cfg.singleton = cfg.hasOwnProperty('singleton') ? cfg.singleton : true;
    let { singleton, name } = cfg;
    return (target) => {
        let key = febs.string.isEmpty(name) ? target : name;
        if (target.__isServiced) {
            throw new Error(`@Bean '${key}': It's already declared`);
        }
        target.__isServiced = true;
        let autowiredName = global[AutowiredInstancesName] = global[AutowiredInstancesName] || {};
        let cname = objectUtils_1.default.getClassNameByClass(target);
        if (autowiredName.hasOwnProperty(cname)) {
            throw new Error(`@ImmediatelyService '${cname}': It's already declared`);
        }
        autowiredName[cname] = true;
        if (typeof key === 'string' && key != cname) {
            if (autowiredName.hasOwnProperty(key)) {
                throw new Error(`@ImmediatelyService '${key}': It's already declared`);
            }
            autowiredName[key] = true;
        }
        let instances = getGlobalServices();
        if (instances.hasOwnProperty(key)) {
            throw new Error(`@Bean '${key}': It's already declared`);
        }
        instances[key] = null;
        if (singleton) {
            let instance = new target();
            instances[key] = { singleton, instance };
            finishAutowired(key, true).then(() => { });
        }
        else {
            let callback = () => __awaiter(this, void 0, void 0, function* () {
                return new target();
            });
            instances[key] = {
                singleton, callback
            };
            finishAutowired(key, true).then(() => { });
        }
    };
}
exports.ImmediatelyService = ImmediatelyService;
function Bean(...args) {
    let cfg;
    if (args.length == 0 || typeof args[0] !== 'string') {
        cfg = args[0] || {};
    }
    else {
        cfg = { name: args[0] };
    }
    cfg.singleton = cfg.hasOwnProperty('singleton') ? cfg.singleton : true;
    let { singleton, name } = cfg;
    return (target, propertyKey, descriptor) => {
        let __bpRefreshScopeInfo = target.__bpRefreshScopeInfo;
        let __bpBeanInfo = target.__bpBeanInfo;
        if (!__bpBeanInfo) {
            __bpBeanInfo = target.__bpBeanInfo = {};
        }
        if (__bpBeanInfo[propertyKey]) {
            return;
        }
        let key = febs.string.isEmpty(name) ? propertyKey : name;
        let instances = getGlobalServices();
        if (instances.hasOwnProperty(key)) {
            throw new Error(`@Bean '${key}': It's already declared`);
        }
        instances[key] = null;
        let callback = () => __awaiter(this, void 0, void 0, function* () {
            let f = descriptor.value.apply(target);
            if (f instanceof Promise) {
                return yield f;
            }
            else {
                return f;
            }
        });
        if (__bpRefreshScopeInfo && typeof __bpRefreshScopeInfo[propertyKey] === 'object') {
            getGlobalRefreshScopeAutowiredBeans().push({
                key,
                callback,
                singleton
            });
            __bpRefreshScopeInfo[propertyKey] = true;
            __bpBeanInfo[propertyKey] = true;
        }
        else {
            __bpBeanInfo[propertyKey] = {
                key,
                singleton,
                callback,
            };
        }
        if (global[FinishAllBeanDelay]) {
            if (singleton) {
                callback().then(res => {
                    instances[key] = { singleton, instance: res };
                    finishAutowired(key, false).then(() => { });
                });
            }
            else {
                instances[key] = {
                    singleton, callback
                };
                finishAutowired(key, false).then(() => { });
            }
        }
        else {
            let waitInstances = getGlobalWaitAutowiredBeans();
            waitInstances.push({
                key,
                propertyKey,
                target,
                singleton,
                callback,
            });
        }
    };
}
exports.Bean = Bean;
function registerRefreshScopeBean(target, propertyKey, descriptor) {
    let __bpBeanInfo = target.__bpBeanInfo;
    let __bpRefreshScopeInfo = target.__bpRefreshScopeInfo;
    if (!__bpRefreshScopeInfo) {
        __bpRefreshScopeInfo = target.__bpRefreshScopeInfo = {};
    }
    if (__bpRefreshScopeInfo[propertyKey]) {
        return;
    }
    if (__bpBeanInfo && __bpBeanInfo[propertyKey]) {
        getGlobalRefreshScopeAutowiredBeans().push({
            key: __bpBeanInfo[propertyKey].key,
            callback: __bpBeanInfo[propertyKey].callback,
            singleton: __bpBeanInfo[propertyKey].singleton
        });
        __bpRefreshScopeInfo[propertyKey] = true;
        __bpBeanInfo[propertyKey] = true;
    }
    else {
        __bpRefreshScopeInfo[propertyKey] = {
            callback: null,
            singleton: null,
        };
    }
}
exports.registerRefreshScopeBean = registerRefreshScopeBean;
function finishAutowired(key, removeAtFinish) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = getServiceInstances(key);
        if (!instance) {
            throw new Error(`Autowired Cannot find Bean : '${key}'`);
        }
        if (typeof key === 'function') {
            key = objectUtils_1.default.getClassNameByClass(key);
        }
        let autos = getGlobalWaitAutowiredClass();
        let autosRefreshScope = getGlobalWaitAutowireds_refreshScope();
        for (let i = 0; i < autos.length; i++) {
            const element = autos[i];
            let elementType = element.type;
            if (typeof elementType === 'function') {
                elementType = objectUtils_1.default.getClassNameByClass(elementType);
            }
            if (element && elementType === key) {
                let instance1;
                if (instance.singleton) {
                    instance1 = instance.instance;
                }
                else {
                    instance1 = yield instance.callback();
                }
                if (!instance1) {
                    throw new Error(`Autowired Cannot find Bean: '${key}'`);
                }
                let className = key;
                (0, logger_1.getLogger)().debug(`[Autowired] ${instance.singleton ? 'singleton' : ''} ` + className);
                element.target[element.propertyKey] = instance1;
                autos.splice(i, 1);
                i--;
                if (!removeAtFinish) {
                    autosRefreshScope.push(element);
                }
            }
        }
    });
}
function finishAutowired_refreshScope(key) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = getServiceInstances(key);
        if (!instance) {
            throw new Error(`Autowired Cannot find Bean : '${key}'`);
        }
        let autosRefreshScope = getGlobalWaitAutowireds_refreshScope();
        for (let i in autosRefreshScope) {
            const element = autosRefreshScope[i];
            if (element && element.type === key) {
                let instance1;
                if (instance.singleton) {
                    instance1 = instance.instance;
                }
                else {
                    instance1 = yield instance.callback();
                }
                if (!instance1) {
                    throw new Error(`Autowired Cannot find Bean: '${key}'`);
                }
                element.target[element.propertyKey] = instance1;
            }
        }
    });
}
//# sourceMappingURL=Service.js.map