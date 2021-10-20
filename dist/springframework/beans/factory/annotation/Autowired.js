'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Autowired = void 0;
require("reflect-metadata");
const Service_1 = require("../../../Service");
function Autowired(type) {
    return (target, propertyKey) => {
        let ins = (0, Service_1.getServiceInstances)(type);
        if (ins) {
            if (ins.singleton) {
                target[propertyKey] = ins.instance;
                if (!ins.instance) {
                    throw new Error(`Autowired Cannot find Bean: '${type}'`);
                }
            }
            else {
                ins.callback().then(res => {
                    target[propertyKey] = res;
                    if (!res) {
                        throw new Error(`Autowired Cannot find Bean: '${type}'`);
                    }
                });
            }
        }
        else {
            (0, Service_1.getGlobalWaitAutowireds)().push({
                target,
                propertyKey,
                type
            });
        }
    };
}
exports.Autowired = Autowired;
//# sourceMappingURL=Autowired.js.map