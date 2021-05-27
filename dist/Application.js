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
exports.Application = void 0;
const springframework_1 = require("./springframework");
const febs = require("febs");
const config_1 = require("./config");
const RefreshRemoteEvent = require("./decorators/events/RefreshRemoteEvent");
const ContextRefreshedEvent = require("./decorators/events/ContextRefreshedEvent");
const FindMicroserviceConfigure = require("./decorators/configure/FindMicroserviceConfigure");
const FeignClientConfigure = require("./decorators/configure/FeignClientConfigure");
const RestControllerConfigure = require("./decorators/configure/RestControllerConfigure");
const discovery = require("./discovery");
const utils_1 = require("./utils");
const discovery_1 = require("./discovery");
const logger_1 = require("./logger");
const Value_1 = require("./springframework/beans/factory/_instances/Value");
const middleware_koa_bodyparser = require("@bpframework/middleware-koa-bodyparser");
const CONFIG_FILE = ['./resource/bootstrap.yml', './resource/application.yml'];
let SERVER_PORT = Number(process.env.BP_ENV_SERVER_PORT);
const SYMBOL_MIDDLEWARES = Symbol('SYMBOL_MIDDLEWARES');
class Application {
    static isCloudConfig() {
        if (!this.__readConfig_ed) {
            throw new Error('isCloudConfig must called after Application.run');
        }
        return !!this.getConfig()['spring.cloud.config.uri'];
    }
    static getLogger() {
        return logger_1.getLogger();
    }
    static _addRefreshRemoteEventListener(listener) {
        RefreshRemoteEvent._addRefreshRemoteEventListener(listener);
    }
    static addRefreshRemoteEventListener(listener) {
        RefreshRemoteEvent._addRefreshRemoteEventListener(listener);
    }
    static use(middleware) {
        if (!middleware
            || typeof middleware.type !== 'string'
            || typeof middleware.initiator !== 'function'
            || (middleware.afterRoute && typeof middleware.afterRoute !== 'function')
            || (middleware.beforeRoute && typeof middleware.beforeRoute !== 'function')) {
            throw new Error(logger_1.LOG_TAG + 'middleware error: ' + middleware.type);
        }
        let arrMiddleware = (global)[SYMBOL_MIDDLEWARES];
        if (!arrMiddleware) {
            arrMiddleware = (global)[SYMBOL_MIDDLEWARES] = [];
        }
        let i;
        for (i = 0; i < arrMiddleware.length; i++) {
            if (arrMiddleware[i].name == middleware.name) {
                break;
            }
        }
        if (i >= arrMiddleware.length) {
            arrMiddleware.push(middleware);
        }
        return Application;
    }
    static runKoa(cfg) {
        logger_1.setLogger(cfg.logger);
        logger_1.setLogLevel(cfg.logLevel);
        Application.initial(cfg, Application._middlewareRunInitatorKoa)
            .then(() => {
            Application._runKoa(cfg.app);
            let port = SERVER_PORT ? SERVER_PORT : this.getConfig()['server.port'];
            cfg.app.listen(port, '0.0.0.0', () => {
                logger_1.getLogger().info('[Name]: ' + this.getConfig()['spring.application.name']);
                logger_1.getLogger().info('[PID]: ' + process.pid);
                logger_1.getLogger().info('[Evn is] : ' + this.getConfig()['spring.profiles.active'] + (__debug ? '(__debug)' : ''));
                logger_1.getLogger().info('[Port is]: ' + port);
                logger_1.getLogger().info('[koa server is running]');
                ContextRefreshedEvent._callContextRefreshedEvent({ configs: config_1.getCloudConfig() }).then(() => { });
            });
        })
            .catch((e) => {
            logger_1.getLogger().error(logger_1.LOG_TAG, '[Init] error\r\n' + utils_1.getErrorMessage(e));
            process.exit(0);
        });
    }
    static get middlewares() {
        return (global)[SYMBOL_MIDDLEWARES] || [];
    }
    static _middlewareRunInitatorKoa(koaApp) {
        let middlewares = Application.middlewares;
        {
            let i;
            for (i = 0; i < middlewares.length; i++) {
                if (middlewares[i].name == middleware_koa_bodyparser.name) {
                    break;
                }
            }
            if (i >= middlewares.length) {
                (global)[SYMBOL_MIDDLEWARES] = middlewares = [middleware_koa_bodyparser.middleware({
                        onErrorBodyParser: (err, ctx) => {
                            ctx.response.status = 415;
                        }
                    })].concat(middlewares);
            }
        }
        middlewares.forEach(element => {
            if (element.type.toLowerCase() != 'koa') {
                throw new Error(logger_1.LOG_TAG + 'middleware isn\'t koa framework: ' + element.name);
            }
            logger_1.getLogger().info(`[middleware] use ${element.name}`);
            element.initiator(koaApp, Application);
        });
    }
    static _middlewareRunContextFinished(koaApp) {
        let middlewares = Application.middlewares;
        middlewares.forEach(element => {
            if (typeof element.contextFinished === 'function') {
                element.contextFinished(koaApp, Application);
            }
        });
    }
    static _runKoa(koaApp) {
        let middlewares = Application.middlewares;
        let middlewaresAfterRoute = [];
        let middlewaresBeforeRoute = [];
        middlewares.forEach(element => {
            if (element.beforeRoute) {
                middlewaresBeforeRoute.push(element);
            }
            if (element.afterRoute) {
                middlewaresAfterRoute.push(element);
            }
        });
        koaApp.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            for (let i in middlewaresBeforeRoute) {
                if ((yield middlewaresBeforeRoute[i].beforeRoute(ctx, Application)) === false) {
                    return;
                }
            }
            let request = {
                headers: ctx.request.headers,
                url: ctx.request.url,
                origin: ctx.request.origin,
                method: ctx.request.method,
                host: ctx.request.host,
                protocol: ctx.request.protocol,
                ip: ctx.request.ip,
                body: ctx.request.body,
            };
            let response = yield springframework_1.CallRestControllerRoute(request, ctx);
            if (response) {
                if (response.headers) {
                    for (const key in response.headers) {
                        ctx.set(key, response.headers[key]);
                    }
                }
                ctx.response.status = response.status;
                ctx.response.body = response.body;
            }
            for (let i in middlewaresAfterRoute) {
                if ((yield middlewaresAfterRoute[i].afterRoute(ctx, Application)) === false) {
                    return;
                }
            }
            yield next();
        }));
    }
    static initial(cfg, prerun) {
        return Application.initialWithConfig(cfg, cfg.configPath || CONFIG_FILE, prerun)
            .then(() => Application.initialWithNacos())
            .then(() => Application.initialWithFeignClient(cfg))
            .then(() => Application.initialWithRouters())
            .then(() => Application._middlewareRunContextFinished(cfg.app));
    }
    static initialWithConfig(cfg, configPath, prerun) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.getLogger().info("[ConfigCenter] Use config from local: " + configPath);
            if (!Array.isArray(configPath)) {
                configPath = [configPath];
            }
            let config = config_1.readYamlConfig(configPath);
            let configs = config_1.setCloudConfig(config);
            this.__readConfig_ed = true;
            Value_1.finishAutowired_values();
            yield springframework_1.finishBeans();
            if (prerun) {
                prerun(cfg.app);
            }
            if (config['spring.cloud.config.uri']) {
                logger_1.getLogger().info("[ConfigCenter] Fetch cloud config from: " + config['spring.cloud.config.uri']);
                try {
                    yield config_1.initSpringCloudConfig({
                        springCloudBusConfigurePrefix: cfg.springCloudBusConfigurePrefix || 'spring.rabbitmq',
                        yamlConfig: config,
                        cbRefresh: (changed, all) => {
                            let ev = {
                                updatedConfigs: changed,
                                latestConfigs: all,
                            };
                            Value_1.finishAutowired_values();
                            springframework_1.finishBeans_refreshScope().then(() => {
                                Application.onConfigRefresh(cfg, ev)
                                    .then(() => RefreshRemoteEvent._callRefreshRemoteEvent(ev))
                                    .then(() => { })
                                    .catch((e) => {
                                    logger_1.getLogger().error(e);
                                });
                            });
                        },
                    });
                    logger_1.getLogger().info(logger_1.LOG_TAG, 'init config');
                }
                catch (e) {
                    logger_1.getLogger().error(e);
                    process.exit(0);
                }
            }
            else {
                return Promise.resolve();
            }
        });
    }
    static initialWithFeignClient(cfg) {
        return __awaiter(this, void 0, void 0, function* () {
            let config = this.getConfig();
            let maxAutoRetriesNextServer;
            let maxAutoRetries;
            let readTimeout;
            if (config.ribbon) {
                maxAutoRetriesNextServer =
                    config.ribbon.MaxAutoRetriesNextServer || maxAutoRetriesNextServer;
                maxAutoRetries = config.ribbon.MaxAutoRetries || maxAutoRetries;
                readTimeout = config.ribbon.ReadTimeout || readTimeout;
            }
            let levelFeign = 'basic';
            if (config['bp.feignLoggingLevel']) {
                levelFeign = config['bp.feignLoggingLevel'];
            }
            let c = yield FeignClientConfigure._callFeignClient();
            springframework_1.setFeignClientDefaultCfg({
                fetch: febs.net.fetch,
                maxAutoRetriesNextServer,
                maxAutoRetries,
                logLevel: levelFeign,
                timeout: readTimeout,
                headers: c ? c.defaultHeaders : null,
                findServiceCallback: this.onFindServiceCallback,
                filterMessageCallback: (receiveMessage, returnMessage, requestServiceName, requestUrl) => {
                    if (c && c.filterResponseCallback) {
                        c.filterResponseCallback({
                            receiveMessage,
                            returnMessage,
                            requestServiceName,
                            requestUrl,
                        });
                    }
                },
            });
        });
    }
    static initialWithNacos() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cloudConfig = Application.getConfig();
                let port = cloudConfig['spring.cloud.nacos.discovery.port'] ||
                    cloudConfig['server.port'];
                if (!port) {
                    throw new Error(logger_1.LOG_TAG + 'must provide a server port');
                }
                if (cloudConfig['spring.cloud.nacos.discovery.serverAddr']) {
                    yield discovery.initNacosNamingClient({
                        serverList: cloudConfig['spring.cloud.nacos.discovery.serverAddr'],
                        namespace: cloudConfig['spring.cloud.nacos.discovery.namespace'],
                        ssl: utils_1.castBoolean(cloudConfig['spring.cloud.nacos.discovery.secure']),
                        registerInfo: {
                            serviceName: cloudConfig['spring.application.name'],
                            ip: cloudConfig['spring.cloud.nacos.discovery.ip'],
                            port: port,
                        },
                    });
                    logger_1.getLogger().info(logger_1.LOG_TAG, 'init nacos finish');
                }
                else {
                    return Promise.resolve();
                }
            }
            catch (e) {
                logger_1.getLogger().error(e);
                process.exit(0);
            }
        });
    }
    static initialWithRouters() {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield RestControllerConfigure._callRestController();
            let config = this.getConfig();
            let levelRest = 'basic';
            if (config['bp.restControllerLoggingLevel']) {
                levelRest = config['bp.restControllerLoggingLevel'];
            }
            springframework_1.setRestControllerDefaultCfg({
                logLevel: levelRest,
                headers: c ? c.defaultHeaders : null,
                filterMessageCallback: (returnMessage, requestUrl) => {
                    if (c && c.filterResponseCallback) {
                        return c.filterResponseCallback({
                            returnMessage,
                            requestUrl,
                        });
                    }
                    else {
                        return returnMessage;
                    }
                },
                errorRequestCallback: (error, request, response) => {
                    if (c && c.errorRequestCallback) {
                        return c.errorRequestCallback(error, request, response);
                    }
                },
                errorResponseCallback: (error, request, response) => {
                    if (c && c.errorResponseCallback) {
                        return c.errorResponseCallback(error, request, response);
                    }
                },
                notFoundCallback: (request, response) => {
                    if (c && c.notFoundCallback) {
                        return c.notFoundCallback(request, response);
                    }
                }
            });
        });
    }
    static onFindServiceCallback(serviceName, excludeHost) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield FindMicroserviceConfigure._callFindMicroservice(serviceName, excludeHost);
            if (r) {
                return r;
            }
            let hosts = yield discovery_1.getNacosService(serviceName);
            if (!hosts || hosts.length == 0) {
                throw new febs.exception(logger_1.LOG_TAG + 'Cannot find service: ' + serviceName, febs.exception.ERROR, __filename, __line, __column);
            }
            while (true) {
                let host = hosts[Math.floor(Math.random() * hosts.length)];
                if (`${host.ip}:${host.port}` === excludeHost && hosts.length > 1) {
                    continue;
                }
                return host;
            }
        });
    }
    static onConfigRefresh(cfg, ev) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ev.updatedConfigs['spring.cloud.config.uri']) {
                yield Application.initialWithConfig(cfg, cfg.configPath || CONFIG_FILE);
            }
            if (ev.updatedConfigs.spring &&
                ev.updatedConfigs.spring.cloud &&
                ev.updatedConfigs.spring.cloud.nacos) {
                yield Application.initialWithNacos();
            }
            if (ev.updatedConfigs.ribbon || (ev.updatedConfigs.bp && ev.updatedConfigs.bp.feignLoggingLevel)) {
                yield Application.initialWithFeignClient(cfg);
            }
            if (ev.updatedConfigs.bp && ev.updatedConfigs.bp.restControllerLoggingLevel) {
                yield Application.initialWithRouters();
            }
        });
    }
}
exports.Application = Application;
Application.__readConfig_ed = false;
Application.getConfig = config_1.getCloudConfig;
Application.readYamlConfig = config_1.readYamlConfigToObjectMap;
//# sourceMappingURL=Application.js.map