'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLazyParameterValue = void 0;
function getLazyParameterValue(arg) {
    if (typeof arg === 'function') {
        return arg();
    }
    else {
        return arg;
    }
}
exports.getLazyParameterValue = getLazyParameterValue;
//# sourceMappingURL=paramUtils.js.map