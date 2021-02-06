'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishAutowired_values = exports.registerValueInstances = void 0;
require("reflect-metadata");
const config_1 = require("../../../../config");
const ValueInstance = Symbol('ValueInstance');
const ValueConfigInstance = Symbol('ValueConfigInstance');
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
    let configs = config_1.getCloudConfig();
    if (!configs) {
        return null;
    }
    if (instances.hasOwnProperty(key)) {
        return instances[key];
    }
    else {
        let vv = key.substring(2, key.length - 1);
        let vv2 = vv.split(":");
        if (!configs.hasOwnProperty(vv2[0])) {
            let v = vv2[1];
            if (!isNaN(v) && typeof v === 'string') {
                v = Number(v);
            }
            instances[key] = v;
            return v;
        }
        else {
            instances[key] = configs[vv2[0]];
            return instances[key];
        }
    }
}
exports.registerValueInstances = registerValueInstances;
function finishAutowired_values() {
    let autos = global[ValueInstance] || [];
    let configs = config_1.getCloudConfig();
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
            let vv2 = vv.split(":");
            if (!configs.hasOwnProperty(vv2[0])) {
                let v = vv2[1];
                if (!isNaN(v) && typeof v === 'string') {
                    v = Number(v);
                }
                instances[key] = v;
            }
            else {
                instances[key] = configs[vv2[0]];
            }
            target[propertyKey] = instances[key];
        }
    }
}
exports.finishAutowired_values = finishAutowired_values;
//# sourceMappingURL=Value.js.map