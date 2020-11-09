'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.setEnableScheduled = exports.getEnableScheduled = void 0;
const enableScheduled = Symbol('enableScheduled');
function getEnableScheduled() {
    return !!global[enableScheduled];
}
exports.getEnableScheduled = getEnableScheduled;
function setEnableScheduled(v) {
    global[enableScheduled] = v;
}
exports.setEnableScheduled = setEnableScheduled;
//# sourceMappingURL=global.js.map