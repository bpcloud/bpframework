import * as bp from './Logger';
import * as Rest from '@/types/springframework/rest_request.d';
import {ImmutableConfigMap} from './struct.d';
import { RefreshRemoteEvent } from './decorators';

/**
 * Config of application.
 */
export type ApplicationConfig = {
  logLevel?: bp.LogLevel
  logger?: bp.BpLogger
  
  /** path of bootstrap.yml; Default value is './resource/bootstrap.yml' */
  configPath?: string|string[]

  /** default is 'spring.rabbitmq' */
  springCloudBusConfigurePrefix?: string
  
  /*
   * To use koa, and so on.
   */
  app: any
}

export type FeignClientInfo = {
  defaultHeaders: any
}

/**
 * Micro-service cell information.
 */
export type ServiceInfo = {
  serviceName: string
  ip: string
  port: number
  weight?: number
  metadata?: any
}

/**
 * @desc 对FeignClient接收的消息进行过滤的信息.
 */
export interface FeignClientFilterResponseData {
  /**
   * 接收到的远程消息对象.
   */
  receiveMessage: any
  /**
   * 将 {receiveMessage} 转换过滤为系统需要的对象, 并存储至retureMessage中.
   */
  returnMessage: any
  /**
   * 请求的服务名称
   */
  requestServiceName: string
  /**
   * 请求的url
   */
  requestUrl: string
}

/**
 * FeignClient configure.
 */
export type FeignClientConfigureInfo = {
  /**
   * Headers that is appended by default every time a request is sent to another microservice.
   */
  defaultHeaders: { [filed: string]: string | string[] }
  /**
   * Processing the data of the response.
   */
  filterResponseCallback: (data: FeignClientFilterResponseData) => void
}

/**
 * @desc 对RestController响应的消息进行过滤的信息.
 */
export interface RestControllerResponseData {
  /**
   * controller处理中返回的值.
   */
  returnMessage: any
  /**
   * 请求的url
   */
  requestUrl: string
}

/**
 * RestController configure.
 */
export type RestControllerConfigureInfo = {
  /**
   * Headers that is appended by default every response to client.
   */
  defaultHeaders: { [filed: string]: string | string[] },
  /**
   * Processing the data of the response, and return the response data.
   */
  filterResponseCallback: (data: RestControllerResponseData) => any,
  /** Error handling, such as data type, occurred while process the request. */
  errorRequestCallback?: (error:Error, request:Rest.RestRequest, response:Rest.RestResponse ) => void,
  /** Error handling, such as data type, occurred while process the response. */
  errorResponseCallback?: (error:Error, request:Rest.RestRequest, response:Rest.RestResponse ) => void,
  /** 404. */
  notFoundCallback?: (request:Rest.RestRequest, response:Rest.RestResponse ) => void,
}


/**
 * @desc 默认会读取 ./resource/bootstrap.yml, ./resource/application.yml 这两个配置文件; 根据配置文件进行应用配置;
 *  配置中 server.port 表示应用端口, 不可在运行期间动态改变.
 */
export class Application {

  /**
   * 判断是否是使用cloud配置 (在应用启动之后生效).
   */
  static isCloudConfig(): boolean;

  /**
   * 日志对象.
   */
  static getLogger(): bp.BpLogger;

  /**
   * @desc: 获取spring配置信息.
   * @example
   *   可以按照如下两种方式获取配置:
   *   1. 按完整路径方式获取配置
   *       Application.getConfig()['spring.cloud.config.uri']
   *   2. 按照健值方式获取配置
   *       Application.getConfig().spring.cloud.config.uri
   */
  static getConfig(): ImmutableConfigMap;

  /**
   * @desc: 读取本地配置文件内容.
   * @example
   *   可以按照如下两种方式获取配置:
   *   1. 按完整路径方式获取配置
   *       Application.getConfig()['spring.cloud.config.uri']
   *   2. 按照健值方式获取配置
   *       Application.getConfig().spring.cloud.config.uri
   */
  static readYamlConfig(configPath:string): ImmutableConfigMap;

  /**
   * Use the middleware.
   * 
   * @param middleware the middleware defer to https://github.com/bpcloud/middleware.git
   */
  static use(middleware: any): Application;

  /**
   * To run koa application.
   */
  static runKoa(cfg: ApplicationConfig): void;

  /**
   * 使用api方式添加一个RefreshRemoteEvent 监听.
   * @param listener
   */
  static addRefreshRemoteEventListener(listener: (ev: RefreshRemoteEvent) => (Promise<void> | void)): void;
}
