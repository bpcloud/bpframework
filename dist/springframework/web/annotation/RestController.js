'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._RestControllerPushRouter = exports._RestControllerDo = exports.CallRestControllerRoute = exports.RestController = exports.setRestControllerDefaultCfg = exports._RestControllerMetadataKey = void 0;
require("reflect-metadata");
const febs = require("febs");
const Service_1 = require("../../Service");
const loggerRest_1 = require("../../../loggerRest");
const urlUtils_1 = require("../../../utils/urlUtils");
const objectUtils_1 = require("../../../utils/objectUtils");
var qs = require('../../../utils/qs/dist');
const DefaultRestControllerCfg = Symbol('DefaultRestControllerCfg');
const RestControllerRouters = Symbol('RestControllerRouters');
const _RestControllerRouterMetadataKey = Symbol('_RestControllerRouterMetadataKey');
exports._RestControllerMetadataKey = Symbol('_RestControllerMetadataKey');
function getRestControllerRouters() {
    let routers = global[RestControllerRouters];
    if (!routers) {
        routers = [];
        global[RestControllerRouters] = routers;
    }
    return routers;
}
function setRestControllerDefaultCfg(cfg) {
    if (cfg.hasOwnProperty('logLevel')) {
        (0, loggerRest_1.setRestLoggerLevel)(cfg.logLevel);
    }
    let c = global[DefaultRestControllerCfg];
    if (!c) {
        c = {};
        global[DefaultRestControllerCfg] = c;
    }
    if (cfg.hasOwnProperty('filterMessageCallback')) {
        c.filterMessageCallback = cfg.filterMessageCallback;
    }
    if (cfg.hasOwnProperty('errorRequestCallback')) {
        c.errorRequestCallback = cfg.errorRequestCallback;
    }
    if (cfg.hasOwnProperty('errorResponseCallback')) {
        c.errorResponseCallback = cfg.errorResponseCallback;
    }
    if (cfg.hasOwnProperty('notFoundCallback')) {
        c.notFoundCallback = cfg.notFoundCallback;
    }
    if (cfg.hasOwnProperty('headers')) {
        c.headers = febs.utils.mergeMap(cfg.headers);
    }
}
exports.setRestControllerDefaultCfg = setRestControllerDefaultCfg;
function getRestControllerDefaultCfg() {
    let cfg = global[DefaultRestControllerCfg];
    cfg = cfg || {};
    return cfg;
}
function RestController(cfg) {
    cfg = cfg || {};
    cfg.path = cfg.path || '';
    let fooService = (0, Service_1.Service)();
    return (target) => {
        fooService(target);
        let routers = Reflect.getOwnMetadata(_RestControllerRouterMetadataKey, target);
        if (routers) {
            let globalRouters = getRestControllerRouters();
            for (let p in routers) {
                let val = routers[p];
                let pp = urlUtils_1.default.join(cfg.path, val.path);
                let pps = pp.split('/');
                pp = '';
                for (let i in pps) {
                    let ppsi = pps[i];
                    if (pp.length > 0 && pp[pp.length - 1] != '/') {
                        pp += '/';
                    }
                    if (ppsi.length != 0) {
                        if (ppsi.length > 2) {
                            if (ppsi[0] == '{' && ppsi[ppsi.length - 1] == '}') {
                                pp += ppsi;
                            }
                            else {
                                pp += encodeURIComponent(ppsi);
                            }
                        }
                        else {
                            pp += encodeURIComponent(ppsi);
                        }
                    }
                    else if (pp.length == 0) {
                        pp += '/';
                    }
                }
                let reg = getPathReg(pp, val.params);
                val.reg = reg.reg;
                val.pathVars = reg.pathVars;
                val.target = target;
                globalRouters.push(val);
            }
        }
        Reflect.defineMetadata(exports._RestControllerMetadataKey, {}, target);
    };
}
exports.RestController = RestController;
function CallRestControllerRoute(request, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        let interval = Date.now();
        let rotuers = getRestControllerRouters();
        if (!rotuers) {
            return Promise.resolve(null);
        }
        let pathname = request.url;
        let querystring = null;
        let qsPos = pathname.indexOf('?');
        if (qsPos >= 0) {
            querystring = pathname.substr(qsPos + 1);
            if (!febs.string.isEmpty(querystring)) {
                querystring = qs.parse(querystring);
                for (let key in querystring) {
                    if (typeof querystring[key] === 'string') {
                        querystring[key] = decodeURIComponent(querystring[key]);
                    }
                }
            }
            pathname = pathname.substr(0, qsPos);
        }
        let cfg = getRestControllerDefaultCfg();
        for (let i = 0; i < rotuers.length; i++) {
            let router = rotuers[i];
            if (router.method == request.method.toLowerCase() && router.reg.test(pathname)) {
                let response = {
                    headers: {},
                    status: 200,
                    body: null
                };
                let matchInfo = { match: true, requestError: null, responseError: null, isIgnoreRestLogger: false };
                let ret;
                try {
                    let target;
                    if (router.serviceInstance) {
                        target = router.serviceInstance;
                    }
                    else {
                        target = router.serviceInstance = (0, Service_1.getServiceInstances)(router.target).instance;
                        router.target = null;
                    }
                    ret = target[router.functionPropertyKey].call(target, {
                        pathname: decodeURIComponent(pathname),
                        querystring,
                        request,
                        response,
                        params: router.params,
                        pathVars: router.pathVars,
                    }, matchInfo, ctx);
                    if (ret instanceof Promise) {
                        ret = yield ret;
                    }
                }
                catch (err) {
                    matchInfo.responseError = err;
                }
                if (matchInfo.requestError) {
                    response.status = 400;
                    interval = Date.now() - interval;
                    (0, loggerRest_1.logRest)(request, { err: '[Error] request error' }, interval);
                    if (cfg.errorRequestCallback) {
                        cfg.errorRequestCallback(matchInfo.requestError, request, response);
                    }
                    return Promise.resolve(response);
                }
                if (matchInfo.responseError) {
                    response.status = 500;
                    interval = Date.now() - interval;
                    (0, loggerRest_1.logRest)(request, { err: '[Error] response error' }, interval);
                    if (cfg.errorResponseCallback) {
                        cfg.errorResponseCallback(matchInfo.responseError, request, response);
                    }
                    return Promise.resolve(response);
                }
                if (!matchInfo.match) {
                    interval = Date.now() - interval;
                    (0, loggerRest_1.logRest)(request, { err: '[404] Route matched, but condition not satisfied: ' + request.url }, interval);
                    response.status = 404;
                    if (cfg.notFoundCallback) {
                        cfg.notFoundCallback(request, response);
                    }
                    return Promise.resolve(response);
                }
                if (!response.body) {
                    if (cfg.filterMessageCallback) {
                        ret = cfg.filterMessageCallback(ret, request.url);
                    }
                    response.body = ret;
                }
                interval = Date.now() - interval;
                if (!matchInfo.isIgnoreRestLogger) {
                    (0, loggerRest_1.logRest)(request, response, interval);
                }
                return Promise.resolve(response);
            }
        }
        interval = Date.now() - interval;
        (0, loggerRest_1.logRest)(request, { err: '[404] Route is not match: ' + pathname }, interval);
        let response1 = {
            headers: {},
            status: 404,
            body: null
        };
        if (cfg.notFoundCallback) {
            const defaultHeaders = febs.utils.mergeMap(cfg.headers);
            if (defaultHeaders) {
                for (const key in defaultHeaders) {
                    response1.headers[key] = defaultHeaders[key];
                }
            }
            cfg.notFoundCallback(request, response1);
        }
        return Promise.resolve(response1);
    });
}
exports.CallRestControllerRoute = CallRestControllerRoute;
function _RestControllerDo(target, ctx, matchInfo, headers, castType, args, pathname, querystring, request, response, params, pathVars) {
    if (headers && typeof headers === 'function') {
        headers = headers();
    }
    const defaultHeaders = febs.utils.mergeMap(getRestControllerDefaultCfg().headers, headers);
    if (defaultHeaders) {
        for (const key in defaultHeaders) {
            response.headers[key] = defaultHeaders[key];
        }
    }
    args.length = 0;
    if (params) {
        for (let i in params) {
            let param = params[i];
            if (args.length <= param.parameterIndex) {
                args.length = param.parameterIndex + 1;
            }
            if (param.type == 'pv') {
                let index = pathVars['{' + param.name + '}'];
                if (!febs.utils.isNull(index)) {
                    let data = pathname.split('/')[index];
                    if (data) {
                        data = decodeURIComponent(data);
                    }
                    else if (param.required) {
                        matchInfo.requestError = new febs.exception(`parameter "${param.name}" is required`, febs.exception.PARAM, __filename, __line, __column);
                        return false;
                    }
                    let datar = objectUtils_1.default.castType(data, param.castType, true);
                    if (datar.e) {
                        matchInfo.requestError = datar.e;
                        return false;
                    }
                    else {
                        args[param.parameterIndex] = datar.data;
                    }
                }
            }
            else if (param.type == 'rb') {
                if (!request.body) {
                    if (param.required) {
                        matchInfo.requestError = new febs.exception(`requestBody is required`, febs.exception.PARAM, __filename, __line, __column);
                        return false;
                    }
                    args[param.parameterIndex] = null;
                }
                else {
                    let datar = objectUtils_1.default.castType(request.body, param.castType, false);
                    if (datar.e) {
                        matchInfo.requestError = datar.e;
                        return false;
                    }
                    else {
                        args[param.parameterIndex] = datar.data;
                    }
                }
            }
            else if (param.type == 'rp') {
                if (!querystring || !querystring.hasOwnProperty(param.name)) {
                    if (param.required && !param.defaultValue) {
                        matchInfo.requestError = new febs.exception(`parameter "${param.name}" is required`, febs.exception.PARAM, __filename, __line, __column);
                        return false;
                    }
                    args[param.parameterIndex] = param.defaultValue;
                }
                else {
                    let data = querystring[param.name];
                    let datar = objectUtils_1.default.castType(data, param.castType, false);
                    if (datar.e) {
                        matchInfo.requestError = datar.e;
                        return false;
                    }
                    else {
                        args[param.parameterIndex] = datar.data;
                    }
                }
            }
            else if (param.type == 'ro') {
                args[param.parameterIndex] = {
                    request,
                    response,
                    responseMsg: null,
                    error: null,
                    ctx,
                };
            }
        }
    }
    return true;
}
exports._RestControllerDo = _RestControllerDo;
function getPathReg(p, params) {
    params = params || [];
    if (p[0] != '/')
        p = '/' + p;
    if (p[p.length - 1] == '/')
        p = p.substr(0, p.length - 1);
    p = febs.string.replace(p, '\\', '\\\\');
    p = febs.string.replace(p, '[', '\[');
    p = febs.string.replace(p, ']', '\]');
    p = febs.string.replace(p, '(', '\(');
    p = febs.string.replace(p, ')', '\)');
    p = febs.string.replace(p, '{', '\{');
    p = febs.string.replace(p, '}', '\}');
    p = febs.string.replace(p, '|', '\|');
    p = febs.string.replace(p, '^', '\^');
    p = febs.string.replace(p, '?', '\?');
    p = febs.string.replace(p, '.', '\.');
    p = febs.string.replace(p, '+', '\+');
    p = febs.string.replace(p, '*', '\*');
    p = febs.string.replace(p, '$', '\$');
    p = febs.string.replace(p, ':', '\:');
    p = febs.string.replace(p, '-', '\-');
    let pathVars = {};
    let segs = p.split('/');
    p = '';
    let pvHadRequired = true;
    for (let i = 0; i < segs.length; i++) {
        if (segs[i].length == 0)
            continue;
        p += '(\\/';
        if (/^\{[a-zA-Z\$_][a-zA-Z\d_]*\}$/.test(segs[i])) {
            p += "[\\w\\~\\!\\*\\(\\)\\-\\_\\'\\.\\%\\@\\$\\&\\+\\=\\[\\]\\;\\:\\,]+" + ")";
            let j;
            for (j = 0; j < params.length; j++) {
                if (params[j].type == 'pv' && '{' + params[j].name + '}' == segs[i]) {
                    if (!params[j].required) {
                        pvHadRequired = false;
                        p += '?';
                    }
                    else if (!pvHadRequired) {
                        throw new Error(`@PathVariable '${params[j].name}': required cannot be 'true', pre-pathVariable required=false`);
                    }
                    break;
                }
            }
            pathVars[segs[i]] = i;
        }
        else {
            p += segs[i] + ')';
        }
    }
    p = '^' + p + '\\/?(\\?.*)?$';
    return { reg: new RegExp(p), pathVars };
}
function _RestControllerPushRouter(targetObject, target, cfg) {
    let routers = Reflect.getOwnMetadata(_RestControllerRouterMetadataKey, target) || [];
    if (Array.isArray(cfg.path)) {
        for (let i = 0; i < cfg.path.length; i++) {
            routers.push({
                target: targetObject,
                serviceInstance: null,
                functionPropertyKey: cfg.functionPropertyKey,
                params: cfg.params,
                path: cfg.path[i],
                method: cfg.method.toLowerCase(),
            });
        }
    }
    else {
        routers.push({
            target: targetObject,
            serviceInstance: null,
            functionPropertyKey: cfg.functionPropertyKey,
            params: cfg.params,
            path: cfg.path,
            method: cfg.method.toLowerCase(),
        });
    }
    Reflect.defineMetadata(_RestControllerRouterMetadataKey, routers, target);
}
exports._RestControllerPushRouter = _RestControllerPushRouter;
//# sourceMappingURL=RestController.js.map