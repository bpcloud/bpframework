'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Value = Value;
require("reflect-metadata");
const Value_1 = require("../_instances/Value");
function Value(value) {
    return (target, propertyKey) => {
        if (typeof value !== 'string'
            || value[0] != '$' || value[1] != '{' || value[value.length - 1] != '}') {
            target[propertyKey] = value;
        }
        else {
            target[propertyKey] = (0, Value_1.registerValueInstances)(target, propertyKey, value);
        }
    };
}
//# sourceMappingURL=Value.js.map