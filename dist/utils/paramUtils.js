'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLazyParameterValue = getLazyParameterValue;
function getLazyParameterValue(arg) {
    if (typeof arg === 'function') {
        return arg();
    }
    else {
        return arg;
    }
}
//# sourceMappingURL=paramUtils.js.map