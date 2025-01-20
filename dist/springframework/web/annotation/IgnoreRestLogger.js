'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports._IgnoreRestLoggerMetadataKey = void 0;
exports.IgnoreRestLogger = IgnoreRestLogger;
require("reflect-metadata");
exports._IgnoreRestLoggerMetadataKey = Symbol('_IgnoreRestLoggerMetadataKey');
function IgnoreRestLogger(target, propertyKey, descriptor) {
    Reflect.defineMetadata(exports._IgnoreRestLoggerMetadataKey, true, target, propertyKey);
}
//# sourceMappingURL=IgnoreRestLogger.js.map