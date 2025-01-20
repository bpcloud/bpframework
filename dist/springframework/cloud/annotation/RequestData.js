'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeignData = FeignData;
exports._FeignDataDo = _FeignDataDo;
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
//# sourceMappingURL=RequestData.js.map