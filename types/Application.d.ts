import * as bp from './Logger';
import * as Rest from 'febs-decorator';
import {ImmutableConfigMap} from './struct.d';

/**
 * Config of application.
 */
export type ApplicationConfig = {
  logLevel?: bp.LogLevel
  logger?: bp.BpLogger
  
  /** path of bootstrap.yml; Default value is './config/bootstrap.yml' */
  configPath?: string

  /** To enable scheduled */
  enableScheduled?: boolean

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
   * 默认的请求headers.
   */
  defaultHeaders: { [filed: string]: string | string[] }
  /**
   * 对每次请求后接收的消息进行过滤.
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
   * 默认的响应headers.
   */
  defaultHeaders: { [filed: string]: string | string[] },
  /**
   * 处理controller处理方法返回的对象returnMessage, 并返回需要response到请求端的内容.
   */
  filterResponseCallback: (data: RestControllerResponseData) => any,
  /** 接收消息时发生数据类型等错误. */
  errorRequestCallback?: (error:Error, request:Rest.RestRequest, response:Rest.RestResponse ) => void,
  /** 响应消息时发生错误. */
  errorResponseCallback?: (error:Error, request:Rest.RestRequest, response:Rest.RestResponse ) => void,
  /** 404. */
  notFoundCallback?: (request:Rest.RestRequest, response:Rest.RestResponse ) => void,
}


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
   * To run koa application.
   */
  static runKoa(cfg: ApplicationConfig): void;
}
