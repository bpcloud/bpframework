'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Autowired = void 0;
require("reflect-metadata");
const Service_1 = require("../../../Service");
const logger_1 = require("../../../../logger");
const objectUtils_1 = require("../../../../utils/objectUtils");
function testConflictNode(child, parent) {
    if (child === parent) {
        let n1 = objectUtils_1.default.getClassNameByClass(child);
        let n2 = objectUtils_1.default.getClassNameByClass(parent);
        throw new Error(`Autowired ${n1} <-> ${n2} circular dependency`);
    }
    if (parent.__autowiredParents) {
        let arr = parent.__autowiredParents.slice(0);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === child) {
                let n1 = objectUtils_1.default.getClassNameByClass(child);
                let n2 = objectUtils_1.default.getClassNameByClass(parent);
                throw new Error(`Autowired ${n1} <-> ${n2} circular dependency`);
            }
            if (arr[i].__autowiredParents) {
                arr = arr.concat(arr[i].__autowiredParents);
            }
        }
        arr.length = 0;
        arr = null;
    }
}
function Autowired(type) {
    return (target, propertyKey) => {
        if (typeof type === 'function') {
            let __autowiredParents1 = type.constructor.__autowiredParents = type.constructor.__autowiredParents || [];
            target.constructor.__autowiredParents = target.constructor.__autowiredParents || [];
            testConflictNode(type, target);
            __autowiredParents1.push(target);
        }
        let ins = (0, Service_1.getServiceInstances)(type);
        if (ins) {
            let className = typeof type === 'function' ? '[' + objectUtils_1.default.getClassNameByClass(type) + ']' : type;
            if (ins.singleton) {
                (0, logger_1.getLogger)().debug(`[Autowired] singleton ` + className);
                target[propertyKey] = ins.instance;
                if (!ins.instance) {
                    throw new Error(`Autowired Cannot find Bean: '${className}'`);
                }
            }
            else {
                ins.callback().then(res => {
                    (0, logger_1.getLogger)().debug(`[Autowired] ` + className);
                    target[propertyKey] = res;
                    if (!res) {
                        throw new Error(`Autowired Cannot find Bean: '${className}'`);
                    }
                });
            }
        }
        else {
            (0, Service_1.pushGlobalWaitAutowireds)({
                target,
                propertyKey,
                type
            });
        }
    };
}
exports.Autowired = Autowired;
//# sourceMappingURL=Autowired.js.map