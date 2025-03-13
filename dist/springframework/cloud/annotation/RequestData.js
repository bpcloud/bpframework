'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports._FeignDataDo = exports.FeignData = void 0;
require("reflect-metadata");
const febs = require("febs");
const RequestMapping_1 = require("../../web/annotation/RequestMapping");
const _FeignDataMetadataKey = Symbol('_FeignDataMetadataKey');
function FeignData(target, propertyKey, parameterIndex) {
    if (Reflect.hasOwnMetadata(_FeignDataMetadataKey, target, propertyKey)) {
        throw new Error('@FeignData must only one');
    }
    Reflect.defineMetadata(_FeignDataMetadataKey, {
        parameterIndex,
    }, target, propertyKey);
    (0, RequestMapping_1._RequestMappingPushParams)(target, propertyKey, {
        parameterIndex,
        type: 'rd',
        castType: null,
    });
}
exports.FeignData = FeignData;
function _FeignDataDo(target, propertyKey, args) {
    let parameter = Reflect.getOwnMetadata(_FeignDataMetadataKey, target, propertyKey);
    if (!parameter) {
        return null;
    }
    let argVal = args[parameter.parameterIndex];
    if (parameter.parameterIndex >= args.length || febs.utils.isNull(argVal)) {
        return null;
    }
    return argVal;
}
exports._FeignDataDo = _FeignDataDo;
//# sourceMappingURL=RequestData.js.map