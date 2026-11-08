'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishAutowired_values = exports.registerValueInstances = void 0;
require("reflect-metadata");
const config_1 = require("../../../../config");
const ValueInstance = Symbol('ValueInstance');
const ValueConfigInstance = Symbol('ValueConfigInstance');
function resolveValueExpression(vv, configs) {
    let colonIndex = vv.indexOf(':');
    let name = colonIndex < 0 ? vv : vv.substring(0, colonIndex);
    if (configs && configs.hasOwnProperty(name)) {
        return configs[name];
    }
    if (colonIndex < 0) {
        return undefined;
    }
    let defaultValue = vv.substring(colonIndex + 1);
    if (defaultValue === '') {
        return '';
    }
    if (defaultValue === 'true') {
        return true;
    }
    if (defaultValue === 'false') {
        return false;
    }
    if (typeof defaultValue === 'string' && defaultValue.trim() !== '' && !isNaN(defaultValue)) {
        return Number(defaultValue);
    }
    return defaultValue;
}
function registerValueInstances(target, propertyKey, key) {
    {
        let instancesObj = global[ValueInstance];
        if (!instancesObj) {
            instancesObj = [];
            global[ValueInstance] = instancesObj;
        }
        instancesObj.push({ target, propertyKey, key });
    }
    let instances = global[ValueConfigInstance];
    if (!instances) {
        instances = {};
        global[ValueConfigInstance] = instances;
    }
    let configs = (0, config_1.getCloudConfig)();
    if (!configs) {
        return null;
    }
    if (instances.hasOwnProperty(key)) {
        return instances[key];
    }
    else {
        let vv = key.substring(2, key.length - 1);
        instances[key] = resolveValueExpression(vv, configs);
        return instances[key];
    }
}
exports.registerValueInstances = registerValueInstances;
function finishAutowired_values() {
    let autos = global[ValueInstance] || [];
    let configs = (0, config_1.getCloudConfig)();
    let instances = {};
    global[ValueConfigInstance] = instances;
    for (const i in autos) {
        const element = autos[i];
        const { target, propertyKey, key } = element;
        if (instances.hasOwnProperty(key)) {
            target[propertyKey] = instances[key];
        }
        else {
            let vv = key.substring(2, key.length - 1);
            instances[key] = resolveValueExpression(vv, configs);
            target[propertyKey] = instances[key];
        }
    }
}
exports.finishAutowired_values = finishAutowired_values;
//# sourceMappingURL=Value.js.map