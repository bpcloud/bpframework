'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshScope = void 0;
const Service_1 = require("../../Service");
function RefreshScope(target, propertyKey, descriptor) {
    (0, Service_1.registerRefreshScopeBean)(target, propertyKey, descriptor);
}
exports.RefreshScope = RefreshScope;
//# sourceMappingURL=RefreshScope.js.map