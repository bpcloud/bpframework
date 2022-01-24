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
exports._FeignClientDo = exports.FeignClient = exports.getFeignClientDefaultCfg = exports.setFeignClientDefaultCfg = exports._FeignClientMetadataKey = void 0;
require("reflect-metadata");
const febs = require("febs");
const logger_1 = require("../../logger");
const loggerRest_1 = require("../../loggerRest");
const urlUtils_1 = require("../../utils/urlUtils");
const objectUtils_1 = require("../../utils/objectUtils");
const paramUtils_1 = require("../../utils/paramUtils");
const utils_1 = require("../../utils");
const FeignClientConfigure_1 = require("../../decorators/configure/FeignClientConfigure");
var qs = require('../../utils/qs/dist');
const DefaultFeignClientCfg = Symbol('DefaultFeignClientCfg');
exports._FeignClientMetadataKey = Symbol('_FeignClientMetadataKey');
function setFeignClientDefaultCfg(cfg) {
    if (cfg.hasOwnProperty('logLevel')) {
        (0, loggerRest_1.setFeignLoggerLevel)(cfg.logLevel);
    }
    let c = global[DefaultFeignClientCfg];
    if (!c) {
        c = {};
        global[DefaultFeignClientCfg] = c;
    }
    if (cfg.hasOwnProperty('fetch')) {
        c.fetch = cfg.fetch;
    }
    if (cfg.hasOwnProperty('maxAutoRetriesNextServer')) {
        c.maxAutoRetriesNextServer = cfg.maxAutoRetriesNextServer;
    }
    if (cfg.hasOwnProperty('maxAutoRetries')) {
        c.maxAutoRetries = cfg.maxAutoRetries;
    }
    if (cfg.hasOwnProperty('findServiceCallback')) {
        c.findServiceCallback = cfg.findServiceCallback;
    }
    if (cfg.hasOwnProperty('filterMessageCallback')) {
        c.filterMessageCallback = cfg.filterMessageCallback;
    }
    if (cfg.hasOwnProperty('mode')) {
        c.mode = cfg.mode;
    }
    if (cfg.hasOwnProperty('headers')) {
        c.headers = febs.utils.mergeMap(cfg.headers);
    }
    if (cfg.hasOwnProperty('timeout')) {
        c.timeout = cfg.timeout;
    }
    if (cfg.hasOwnProperty('credentials')) {
        c.credentials = cfg.credentials;
    }
}
exports.setFeignClientDefaultCfg = setFeignClientDefaultCfg;
function getFeignClientDefaultCfg() {
    let cfg = global[DefaultFeignClientCfg];
    cfg = cfg || {};
    cfg.fetch = cfg.fetch || febs.net.fetch;
    cfg.maxAutoRetriesNextServer = cfg.maxAutoRetriesNextServer || 3;
    cfg.maxAutoRetries = cfg.maxAutoRetries || 2;
    cfg.timeout = cfg.timeout || 20000;
    return cfg;
}
exports.getFeignClientDefaultCfg = getFeignClientDefaultCfg;
function FeignClient(cfg) {
    if (febs.string.isEmpty(cfg.name)) {
        throw new Error("@FeignClient need 'name' parameter");
    }
    cfg.path = cfg.path || '';
    return (target) => {
        Reflect.defineMetadata(exports._FeignClientMetadataKey, {
            name: cfg.name,
            url: cfg.url,
            path: cfg.path,
        }, target);
    };
}
exports.FeignClient = FeignClient;
function _FeignClientDo(target, requestMapping, feignData, restObject, castType, args, fallback) {
    return __awaiter(this, void 0, void 0, function* () {
        if (requestMapping.qs.length > 1) {
            throw new Error("@RequestMapping in FeignClient class, 'path' must container only one url");
        }
        let meta = Reflect.getOwnMetadata(exports._FeignClientMetadataKey, target.constructor);
        let url = urlUtils_1.default.join(meta.path, requestMapping.qs[0]);
        let feignClientCfg = getFeignClientDefaultCfg();
        if (typeof feignClientCfg.findServiceCallback !== 'function') {
            throw new Error(`feignClient 'findServiceCallback' must be a function`);
        }
        let excludeHost = null;
        let request;
        let response;
        let responseMsg;
        let lastError;
        let cfgurl = (0, paramUtils_1.getLazyParameterValue)(meta.url);
        for (let i = 0; i < feignClientCfg.maxAutoRetriesNextServer; i++) {
            let uri;
            let uriPathname = url;
            if (!febs.string.isEmpty(cfgurl) && __debugFeignClient) {
                uri = urlUtils_1.default.join(cfgurl, url);
            }
            else {
                let host;
                try {
                    host = yield feignClientCfg.findServiceCallback(meta.name, excludeHost);
                    if (!host) {
                        continue;
                    }
                }
                catch (e) {
                    lastError = e;
                    (0, logger_1.getLogger)().error((0, utils_1.getErrorMessage)(e));
                    continue;
                }
                excludeHost = `${host.ip}:${host.port}`;
                uri = urlUtils_1.default.join(excludeHost, url);
                if (host.port == 443) {
                    if (uri[0] == '/')
                        uri = 'https:/' + uri;
                    else
                        uri = 'https://' + uri;
                }
                else {
                    if (uri[0] == '/')
                        uri = 'http:/' + uri;
                    else
                        uri = 'http://' + uri;
                }
            }
            request = {
                method: requestMapping.method.toString(),
                mode: requestMapping.mode,
                headers: febs.utils.mergeMap(feignClientCfg.headers, requestMapping.headers, feignData ? feignData.headers : null),
                timeout: requestMapping.timeout,
                credentials: requestMapping.credentials,
                body: requestMapping.body,
                url: uri,
            };
            let c = yield (0, FeignClientConfigure_1._callFeignClient)();
            if (c && c.filterRequestCallback) {
                c.filterRequestCallback(request, feignData);
            }
            for (let j = 0; j < feignClientCfg.maxAutoRetries; j++) {
                let status;
                let r;
                let interval = Date.now();
                try {
                    response = null;
                    responseMsg = null;
                    lastError = null;
                    let ret = yield feignClientCfg.fetch(uri, request);
                    response = ret;
                    status = ret.status;
                    interval = Date.now() - interval;
                    let contentType = ret.headers.get('content-type');
                    if (Array.isArray(contentType)) {
                        contentType = contentType[0];
                    }
                    contentType = contentType ? contentType.toLowerCase() : 'application/json';
                    if (febs.string.isEmpty(contentType) || contentType.indexOf('application/x-www-form-urlencoded') >= 0) {
                        let txt = yield ret.text();
                        (0, loggerRest_1.logFeignClient)(request, febs.utils.mergeMap(response, { body: txt }), interval);
                        r = qs.parse(txt);
                    }
                    else if (contentType.indexOf('application/json') >= 0) {
                        r = yield ret.json();
                        (0, loggerRest_1.logFeignClient)(request, febs.utils.mergeMap(response, { body: r }), interval);
                    }
                    else {
                        r = yield ret.blob();
                        (0, loggerRest_1.logFeignClient)(request, febs.utils.mergeMap(response, { body: r }), interval);
                    }
                    responseMsg = r;
                }
                catch (e) {
                    (0, loggerRest_1.logFeignClient)(request, { err: e }, 0);
                    lastError = e;
                    (0, logger_1.getLogger)().error((0, utils_1.getErrorMessage)(e));
                    continue;
                }
                try {
                    if (status && (status < 200 || status >= 300)) {
                        throw new Error("HttpStatusCode is " + status);
                    }
                    if (!r) {
                        return r;
                    }
                    else if (!castType) {
                        if (feignClientCfg.filterMessageCallback) {
                            let rr = {};
                            feignClientCfg.filterMessageCallback(r, rr, meta.name, uriPathname);
                            return rr;
                        }
                        else {
                            return r;
                        }
                    }
                    else {
                        let o = new castType();
                        if (feignClientCfg.filterMessageCallback) {
                            feignClientCfg.filterMessageCallback(r, o, meta.name, uriPathname);
                            return o;
                        }
                        else {
                            let datar = objectUtils_1.default.castType(r, castType, false);
                            if (datar.e) {
                                throw datar.e;
                            }
                            o = datar.data;
                        }
                        return o;
                    }
                }
                catch (e) {
                    if (restObject) {
                        if (args.length <= restObject.parameterIndex) {
                            args.length = restObject.parameterIndex + 1;
                        }
                        args[restObject.parameterIndex] = {
                            request,
                            response,
                            responseMsg: responseMsg,
                            error: e,
                        };
                    }
                    return yield fallback();
                }
            }
        }
        if (restObject) {
            if (args.length <= restObject.parameterIndex) {
                args.length = restObject.parameterIndex + 1;
            }
            args[restObject.parameterIndex] = {
                request,
                response,
                responseMsg: responseMsg,
                error: lastError,
            };
        }
        return yield fallback();
    });
}
exports._FeignClientDo = _FeignClientDo;
//# sourceMappingURL=FeignClient.js.map