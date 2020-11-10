'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 * Author: brian.li
 * Date: 2020-10-30 20:49
 * Desc:
 */

import {
  CallRestControllerRoute,
  setFeignClientDefaultCfg,
  setRestControllerDefaultCfg,
} from 'febs-decorator'
import * as febs from 'febs'
import {
  readYamlConfig,
  initSpringCloudConfig,
  getCloudConfig,
  setCloudConfig,
} from './config'
import * as RefreshRemoteEvent from './decorators/events/RefreshRemoteEvent'
import * as ContextRefreshedEvent from './decorators/events/ContextRefreshedEvent'
import * as FindMicroserviceConfigure from './decorators/configure/FindMicroserviceConfigure'
import * as FeignClientConfigure from './decorators/configure/FeignClientConfigure'
import * as RestControllerConfigure from './decorators/configure/RestControllerConfigure'
import * as discovery from './discovery'
import { castBoolean, getErrorMessage } from './utils'
import { getNacosService } from './discovery'
import { LOG_TAG, setLogger, getLogger, setLogLevel } from './logger'
import { ApplicationConfig, ServiceInfo } from '../types/Application'
import { setEnableScheduled } from './global'

const CONFIG_FILE = './config/bootstrap.yml'

/**
 * @desc 将会读取 ./config/bootstrap.yml 配置文件; 根据配置文件进行应用配置;
 *  配置中 server.port 表示应用端口, 不可在运行期间动态改变.
 */
export class Application {
  /**
   * @desc: 获取spring配置信息.
   * @example
   *   可以按照如下两种方式获取配置:
   *   1. 按完整路径方式获取配置
   *       Application.getConfig()['spring.cloud.config.uri']
   *   2. 按照健值方式获取配置
   *       Application.getConfig().spring.cloud.config.uri
   */
  static getConfig = getCloudConfig

  /**
   * To run koa application.
   */
  static runKoa(cfg: ApplicationConfig): void {
    setLogger(cfg.logger)
    setLogLevel(cfg.logLevel)

    setEnableScheduled(!!cfg.enableScheduled);

    Application.initial(cfg)
      .then(() => {
        Application.useKoa(cfg.app);

        let port = this.getConfig()['server.port']
        cfg.app.listen(port, '0.0.0.0', () => {
          // log info.
          getLogger().info('[pid]: ' + process.pid)
          getLogger().info('[Evn is] : ' + (__debug ? 'dev' : 'prod'))
          getLogger().info('[Port is]: ' + port)
          getLogger().info('[koa server is running]')
        });

        // var server = require('http').createServer(cfg.httpCallback)

        // // http server.
        // server.listen(port, '0.0.0.0', () => {
        //   // log info.
        //   getLogger().info('[pid]: ' + process.pid)
        //   getLogger().info('[Evn is] : ' + (__debug ? 'dev' : 'prod'))
        //   getLogger().info('[Port is]: ' + port)
        //   getLogger().info('[server is running]')
        // })
      })
      .catch((e) => {
        getLogger().error(
          LOG_TAG, '[Init] error\r\n' + getErrorMessage(e)
        )
        process.exit(0)
      })
  }

  /**
   * 使用koaRouter初始化路由.
   * @param koaRouter 传入外部使用的koaRouter对象.
   */
  private static useKoa(koaApp: any) {
    koaApp.use(async (ctx: any, next: any) => {
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

      let response = await CallRestControllerRoute(request, ctx);
      if (response) {
        // headers.
        if (response.headers) {
          for (const key in response.headers) {
            ctx.set(key, response.headers[key]);
          }
        }
        // status.
        ctx.response.status = response.status;
        // body.
        ctx.response.body = response.body;
      }

      await next();
    });
  }


  /**
   * initial
   */
  private static initial(cfg: ApplicationConfig): Promise<void> {
    return Application.initialWithConfig(cfg, cfg.configPath||CONFIG_FILE)
      .then(() => Application.initialWithNacos())
      .then(() => Application.initialWithFeignClient(cfg))
      .then(() => Application.initialWithRouters())
  }

  private static async initialWithConfig(
    cfg: ApplicationConfig,
    configPath: string
  ): Promise<void> {
    let config = readYamlConfig(configPath)
    let configs: any = setCloudConfig(config);

    await ContextRefreshedEvent._callContextRefreshedEvent({ configs: configs })

    //
    // cloud config.
    if (config['spring.cloud.config.uri']) {
      try {
        // config center.
        await initSpringCloudConfig({
          yamlConfig: config,
          cbRefresh: (changed, all) => {
            let ev = {
              updatedConfigs: changed,
              latestConfigs: all,
            }
            Application.onConfigRefresh(cfg, ev)
              .then(() => RefreshRemoteEvent._callRefreshRemoteEvent(ev))
              .then(() => {})
              .catch((e) => {
                getLogger().error(e)
              })
          },
        })

        getLogger().info(LOG_TAG, 'init config')
      } catch (e) {
        getLogger().error(e)
        process.exit(0)
      }
    } else {
      return Promise.resolve()
    } // if..else.
  }

  /**
   * 初始化feignClient
   */
  private static async initialWithFeignClient(
    cfg: ApplicationConfig
  ): Promise<void> {
    let config = this.getConfig()

    let maxAutoRetriesNextServer;
    let maxAutoRetries;
    let readTimeout;
    if (config.ribbon) {
      maxAutoRetriesNextServer =
        config.ribbon.MaxAutoRetriesNextServer || maxAutoRetriesNextServer
      maxAutoRetries = config.ribbon.MaxAutoRetries || maxAutoRetries
      readTimeout = config.ribbon.ReadTimeout || readTimeout
    }

    let levelFeign = 'basic';
    if (config['bp.feignLoggingLevel']) {
      levelFeign = config['bp.feignLoggingLevel'];
    }

    let c = await FeignClientConfigure._callFeignClient();

    setFeignClientDefaultCfg({
      fetch: febs.net.fetch as any,
      maxAutoRetriesNextServer,
      maxAutoRetries,
      logLevel: levelFeign as any,
      timeout: readTimeout,
      headers: c?c.defaultHeaders:null,
      findServiceCallback: this.onFindServiceCallback,
      /** 处理收到的对象receiveMessage, 将正确的结果存储至retureMessage中 */
      filterMessageCallback: (
        receiveMessage: any,
        returnMessage: any,
        requestServiceName: string,
        requestUrl: string
      ) => {
        if (c && c.filterResponseCallback) {
          c.filterResponseCallback({
            receiveMessage,
            returnMessage,
            requestServiceName,
            requestUrl,
          });
        }
      },
    })
  }

  /**
   * @desc: 初始化nacos.
   * 需要如下配置:
   *
   * @example
   *   spring.application.name
   *   spring.cloud.nacos.discovery:
   *     ip          # 当前服务注册的ip
   *     port?       # 当前服务注册的port
   *     serverAddr  # 服务器的地址.
   *     namespace?
   *     secure?
   */
  private static async initialWithNacos(): Promise<void> {
    try {
      let cloudConfig = Application.getConfig()

      // nacos.
      let port =
        cloudConfig['spring.cloud.nacos.discovery.port'] ||
        cloudConfig['server.port']
      if (!port) {
        throw new Error(LOG_TAG + 'must provide a server port')
      }

      if (cloudConfig['spring.cloud.nacos.discovery.serverAddr']) {
        await discovery.initNacosNamingClient({
          serverList: cloudConfig['spring.cloud.nacos.discovery.serverAddr'],
          namespace: cloudConfig['spring.cloud.nacos.discovery.namespace'],
          ssl: castBoolean(cloudConfig['spring.cloud.nacos.discovery.secure']),
          registerInfo: {
            serviceName: cloudConfig['spring.application.name'],
            ip: cloudConfig['spring.cloud.nacos.discovery.ip'],
            port: port,
          },
        })

        getLogger().info(LOG_TAG, 'init nacos finish')
      } else {
        return Promise.resolve()
      }
    } catch (e) {
      getLogger().error(e)
      process.exit(0)
    }
  }

  /**
   * @desc: 初始化routers.
   */
  private static async initialWithRouters(): Promise<void> {
    let c = await RestControllerConfigure._callRestController();

    let config = this.getConfig()
    let levelRest = 'basic';
    if (config['bp.restControllerLoggingLevel']) {
      levelRest = config['bp.restControllerLoggingLevel'];
    }

    setRestControllerDefaultCfg({
      logLevel: levelRest as any,
      headers: c?c.defaultHeaders:null,
      filterMessageCallback: (returnMessage: any, requestUrl: string) => {
        if (c && c.filterResponseCallback) {
          return c.filterResponseCallback({
            returnMessage,
            requestUrl,
          });
        } else {
          return returnMessage;
        }
      },
      /** 接收消息时发生数据类型等错误. */
      errorRequestCallback: (error: Error, request: any, response: any): void => {
        if (c && c.errorRequestCallback) {
          return c.errorRequestCallback(error, request, response);
        }
      },
      /** 响应消息时发生错误. */
      errorResponseCallback: (error: Error, request: any, response: any): void => {
        if (c && c.errorResponseCallback) {
          return c.errorResponseCallback(error, request, response);
        }
      },
      /** 404. */
      notFoundCallback: (request: any, response: any): void => {
        if (c && c.notFoundCallback) {
          return c.notFoundCallback(request, response);
        }
      }
    })
  }

  /**
   * @desc 返回指定的服务信息.
   */
  private static async onFindServiceCallback(
    serviceName: string,
    excludeHost: string
  ): Promise<ServiceInfo> {
    let r = await FindMicroserviceConfigure._callFindMicroservice(serviceName, excludeHost);
    if (r) {
      return r;
    }
    
    // use nacos or eureka api to get a host.
    let hosts = await getNacosService(serviceName)
    if (!hosts || hosts.length == 0) {
      return null
    }

    while (true) {
      let host = hosts[Math.floor(Math.random() * hosts.length)]
      if (`${host.ip}:${host.port}` === excludeHost && hosts.length > 1) {
        continue
      }

      return host
    }
  }

  /**
   * 配置刷新后处理.
   * @param cfg
   */
  private static async onConfigRefresh(
    cfg: ApplicationConfig,
    ev: RefreshRemoteEvent.RefreshRemoteEvent
  ) {
    //
    if (ev.updatedConfigs['spring.cloud.config.uri']) {
      await Application.initialWithConfig(cfg, cfg.configPath||CONFIG_FILE)
    }

    //
    if (
      ev.updatedConfigs.spring &&
      ev.updatedConfigs.spring.cloud &&
      ev.updatedConfigs.spring.cloud.nacos
    ) {
      await Application.initialWithNacos()
    }

    //
    if (ev.updatedConfigs.ribbon || (ev.updatedConfigs.bp && ev.updatedConfigs.bp.feignLoggingLevel)) {
      await Application.initialWithFeignClient(cfg)
    }

    // 
    if (ev.updatedConfigs.bp && ev.updatedConfigs.bp.restControllerLoggingLevel) {
      await Application.initialWithRouters();
    }
  }
}
