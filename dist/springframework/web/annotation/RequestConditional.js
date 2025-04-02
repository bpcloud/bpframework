'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestConditional = exports.getRequestConditional = exports._RequestConditionalMetadataKey = void 0;
require("reflect-metadata");
exports._RequestConditionalMetadataKey = Symbol('_RequestConditionalMetadataKey');
function getRequestConditional(target, propertyKey) {
    return Reflect.getOwnMetadata(exports._RequestConditionalMetadataKey, target, propertyKey) || [];
}
exports.getRequestConditional = getRequestConditional;
function RequestConditional(match) {
    return function (target, propertyKey, descriptor) {
        let routers = Reflect.getOwnMetadata(exports._RequestConditionalMetadataKey, target.constructor, propertyKey) || [];
        routers.push({ match });
        Reflect.defineMetadata(exports._RequestConditionalMetadataKey, routers, target.constructor, propertyKey);
    };
}
exports.RequestConditional = RequestConditional;
//# sourceMappingURL=RequestConditional.js.map