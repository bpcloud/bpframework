'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshScope = RefreshScope;
const Service_1 = require("../../Service");
function RefreshScope(target, propertyKey, descriptor) {
    (0, Service_1.registerRefreshScopeBean)(target, propertyKey, descriptor);
}
//# sourceMappingURL=RefreshScope.js.map