'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathVariable = PathVariable;
exports._PathVariableDo = _PathVariableDo;
require("reflect-metadata");
const febs = require("febs");
const RequestMapping_1 = require("./RequestMapping");
const _PathVariableMetadataKey = Symbol('_PathVariableMetadataKey');
function PathVariable(cfg) {
    if (febs.string.isEmpty(cfg.name)) {
        throw new Error('@RequestParam need \'name\' parameter');
    }
    cfg.required = febs.utils.isNull(cfg.required) ? true : cfg.required;
    return (target, propertyKey, parameterIndex) => {
        let existingParameters = Reflect.getOwnMetadata(_PathVariableMetadataKey, target, propertyKey) || [];
        existingParameters.push({
            name: cfg.name,
            required: cfg.required,
            parameterIndex,
            castType: cfg.castType
        });
        Reflect.defineMetadata(_PathVariableMetadataKey, existingParameters, target, propertyKey);
        (0, RequestMapping_1._RequestMappingPushParams)(target, propertyKey, {
            name: cfg.name,
            required: cfg.required,
            parameterIndex,
            type: 'pv',
            castType: cfg.castType
        });
    };
}
function _PathVariableDo(target, propertyKey, args, pathVariables) {
    let parameters = Reflect.getOwnMetadata(_PathVariableMetadataKey, target, propertyKey);
    if (parameters) {
        for (let parameter of parameters) {
            if (parameter.required) {
                if (parameter.parameterIndex >= args.length || febs.utils.isNull(args[parameter.parameterIndex])) {
                    throw new Error("@PathVariable Missing required argument.");
                }
            }
            if (!pathVariables.hasOwnProperty(parameter.name)) {
                throw new febs.exception(`@PathVariable parameter '${parameter.name}' cannot be finded`, febs.exception.PARAM, __filename, __line, __column);
            }
            pathVariables[parameter.name] = args[parameter.parameterIndex];
        }
    }
    return true;
}
//# sourceMappingURL=PathVariable.js.map