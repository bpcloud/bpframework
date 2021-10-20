'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports._RequestParamDo = exports.RequestParam = void 0;
require("reflect-metadata");
const febs = require("febs");
const RequestMapping_1 = require("./RequestMapping");
var queryString = require('../../../utils/qs/dist');
const _RequestParamMetadataKey = Symbol('_RequestParamMetadataKey');
function RequestParam(cfg) {
    if (febs.string.isEmpty(cfg.name)) {
        throw new Error('@RequestParam need \'name\' parameter');
    }
    cfg.required = febs.utils.isNull(cfg.required) ? true : cfg.required;
    return (target, propertyKey, parameterIndex) => {
        let existingParameters = Reflect.getOwnMetadata(_RequestParamMetadataKey, target, propertyKey) || [];
        existingParameters.push({
            name: cfg.name,
            required: cfg.required,
            defaultValue: cfg.defaultValue,
            castType: cfg.castType,
            parameterIndex,
        });
        Reflect.defineMetadata(_RequestParamMetadataKey, existingParameters, target, propertyKey);
        (0, RequestMapping_1._RequestMappingPushParams)(target, propertyKey, {
            name: cfg.name,
            required: cfg.required,
            defaultValue: cfg.defaultValue,
            castType: cfg.castType,
            parameterIndex,
            type: 'rp'
        });
    };
}
exports.RequestParam = RequestParam;
function _RequestParamDo(target, propertyKey, args, requestMapping) {
    let parameters = Reflect.getOwnMetadata(_RequestParamMetadataKey, target, propertyKey);
    if (parameters) {
        let qs = '';
        for (let parameter of parameters) {
            let val = args[parameter.parameterIndex];
            if (parameter.required) {
                if (parameter.parameterIndex >= args.length || febs.utils.isNull(val)) {
                    if (!parameter.defaultValue) {
                        throw new febs.exception("@RequestParam Missing required argument.", febs.exception.PARAM, __filename, __line, __column);
                    }
                }
            }
            if (febs.utils.isNull(val)) {
                val = parameter.defaultValue;
            }
            let obj = {};
            obj[parameter.name] = val;
            qs += queryString.stringify(obj);
            for (const key in requestMapping.path) {
                let p = requestMapping.path[key];
                let i = p.indexOf('?');
                if (i == p.length - 1) {
                    p += qs;
                }
                else if (i < 0) {
                    p += '?' + qs;
                }
                else {
                    p += '&' + qs;
                }
                requestMapping.path[key] = p;
            }
        }
    }
}
exports._RequestParamDo = _RequestParamDo;
//# sourceMappingURL=RequestParam.js.map