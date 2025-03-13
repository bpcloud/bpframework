'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.IgnoreRestLogger = exports._IgnoreRestLoggerMetadataKey = void 0;
require("reflect-metadata");
exports._IgnoreRestLoggerMetadataKey = Symbol('_IgnoreRestLoggerMetadataKey');
function IgnoreRestLogger(target, propertyKey, descriptor) {
    Reflect.defineMetadata(exports._IgnoreRestLoggerMetadataKey, true, target, propertyKey);
}
exports.IgnoreRestLogger = IgnoreRestLogger;
//# sourceMappingURL=IgnoreRestLogger.js.map