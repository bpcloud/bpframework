'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Value = void 0;
require("reflect-metadata");
const Value_1 = require("../_instances/Value");
function Value(value) {
    return (target, propertyKey) => {
        if (typeof value !== 'string'
            || value[0] != '$' || value[1] != '{' || value[value.length - 1] != '}') {
            target[propertyKey] = value;
        }
        else {
            target[propertyKey] = Value_1.registerValueInstances(target, propertyKey, value);
        }
    };
}
exports.Value = Value;
//# sourceMappingURL=Value.js.map