'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports._RequestBodyDo = exports.RequestBody = void 0;
require("reflect-metadata");
const febs = require("febs");
const RequestMapping_1 = require("./RequestMapping");
var qs = require('../../../utils/qs/dist');
const _RequestBodyMetadataKey = Symbol('_RequestBodyMetadataKey');
function RequestBody(...args) {
    if (args.length == 1) {
        let cfg = args[0];
        cfg.required = febs.utils.isNull(cfg.required) ? true : cfg.required;
        return (target, propertyKey, parameterIndex) => {
            if (Reflect.hasOwnMetadata(_RequestBodyMetadataKey, target, propertyKey)) {
                throw new Error('@RequestBody must only one');
            }
            Reflect.defineMetadata(_RequestBodyMetadataKey, {
                required: cfg.required,
                stringifyCallback: cfg.stringifyCallback,
                castType: cfg.castType,
                parameterIndex,
            }, target, propertyKey);
            RequestMapping_1._RequestMappingPushParams(target, propertyKey, {
                required: cfg.required,
                parameterIndex,
                type: 'rb',
                castType: cfg.castType,
            });
        };
    }
    else {
        let target = args[0];
        let propertyKey = args[1];
        let parameterIndex = args[2];
        if (Reflect.hasOwnMetadata(_RequestBodyMetadataKey, target, propertyKey)) {
            throw new Error('@RequestBody must only one');
        }
        Reflect.defineMetadata(_RequestBodyMetadataKey, {
            required: false,
            stringifyCallback: null,
            parameterIndex,
            castType: undefined,
        }, target, propertyKey);
        RequestMapping_1._RequestMappingPushParams(target, propertyKey, {
            required: false,
            parameterIndex,
            type: 'rb',
            castType: undefined,
        });
    }
}
exports.RequestBody = RequestBody;
function _RequestBodyDo(target, propertyKey, args, requestMapping) {
    let parameter = Reflect.getOwnMetadata(_RequestBodyMetadataKey, target, propertyKey);
    if (!parameter) {
        return;
    }
    let argVal = args[parameter.parameterIndex];
    if (parameter.required) {
        if (parameter.parameterIndex >= args.length || febs.utils.isNull(argVal)) {
            throw new febs.exception(`@RequestBody Missing required argument`, febs.exception.PARAM, __filename, __line, __column);
        }
    }
    let paramStr;
    let t = typeof argVal;
    if (typeof parameter.stringifyCallback === 'function') {
        paramStr = parameter.stringifyCallback(argVal);
    }
    else if (t === 'string') {
        paramStr = argVal;
    }
    else if (t === 'boolean' || t === 'number' || t === 'bigint') {
        paramStr = argVal.toString();
    }
    else {
        let isJson = false;
        if (requestMapping.method === 'GET') {
            isJson = false;
        }
        else if (requestMapping.headers) {
            for (let k in requestMapping.headers) {
                if (k.toLowerCase() === 'content-type') {
                    let v = requestMapping.headers[k];
                    if (v && v.indexOf('application/json') >= 0) {
                        isJson = true;
                    }
                    break;
                }
            }
        }
        if (isJson) {
            paramStr = JSON.stringify(argVal);
        }
        else {
            paramStr = qs.stringify(argVal);
        }
    }
    if (febs.string.isEmpty(paramStr)) {
        return;
    }
    if (requestMapping.method === 'GET') {
        for (const key in requestMapping.path) {
            let p = requestMapping.path[key];
            let i = p.indexOf('?');
            if (i == p.length - 1) {
                p += paramStr;
            }
            else if (i < 0) {
                p += '?' + paramStr;
            }
            else {
                p += '&' + paramStr;
            }
            requestMapping.path[key] = p;
        }
    }
    else {
        requestMapping.body = paramStr;
    }
}
exports._RequestBodyDo = _RequestBodyDo;
//# sourceMappingURL=RequestBody.js.map