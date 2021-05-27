// Type definitions for febs

/// <reference types="node" />

import * as Rest from './rest_request.d';
import * as fetch from 'febs/types/fetch.d';
import { StringLazyParameter, LazyParameter } from '../lazyParameter.d';

/**
 * Rest log level.
 */
export enum RestLogLevel {
  /** no logging */
  NONE = 'NONE',
  /** Log only the request method and URL and the response status code and execution time. */
  BASIC = 'BASIC',
  /** Log the basic information along with request and response headers */
  HEADERS = 'HEADERS',
  /** Log the headers, body, and metadata for both requests and responses */
  FULL = 'FULL',
}

/**
 * @desc 表明指定的类为feignClient类.
 *
 *      仅支持service返回格式为 application/json或application/x-www-form-urlencoded; 其他格式返回字节流
 *
 * @returns {ClassDecorator}
 */
export function FeignClient(cfg: {
  /** 指定微服务的名称 */
  name: string
  /** 用于调试, 指定调用的地址, 使用此地址通信. (必须设置 __debugFeignClient = true 才能生效) */
  url?: StringLazyParameter
  /** 定义FeignClient类中请求的统一前缀 */
  path?: string
}): ClassDecorator;

/**
 * Micro-service cell information.
 */
export type MicroserviceInfo = {
  serviceName: string,
  ip: string,
  port: number,
  weight?: number,
  metadata?: any
};

/**
 * @desc: 设置默认的请求配置. 可用于设置fetch对象, 重试信息等.
 *
 *     负载均衡策略由 findServiceCallback 提供.
 *
 * @example
 *   import * as fetch from 'node-fetch'
 *   setFeignClientDefaultCfg({
 *      fetch:fetch as any,
 *      findServiceCallback(serviceName, excludeHost):Promise<ip:string, port:number>=> {
 *        return Promise.resolve({ip, port}); 
 *      }
 *   });
 */
export function setFeignClientDefaultCfg(cfg: {
  /** 网络请求对象, 当在back-end使用时需设置; 可使用 node-fetch等兼容api */
  fetch?: fetch.Fetch
  /** 最大更换实例次数; (默认3) */
  maxAutoRetriesNextServer?: number
  /** 同一实例的重试次数; (默认2) */
  maxAutoRetries?: number
  /** 每次请求需要附加的header */
  headers?: { [key: string]: string|string[] },
  /** 请求超时, 默认20000ms */
  timeout?: number,
  /** 日志级别. */
  logLevel?: RestLogLevel,
  /** 获取指定service的回调. */
  findServiceCallback: (
    serviceName: string,
    excludeHost: string
  ) => Promise<MicroserviceInfo>,
  /** 
   * 处理收到的对象receiveMessage, 将正确的结果存储至retureMessage中. 
   * 若抛出异常则表明消息错误, 将会由RestObject传递给controller.
   */
  filterMessageCallback?: (receiveMessage: any, returnMessage: any, requestService: string, requestUrl: string) => void,
  /** 在front-end使用时设置跨域等信息 */
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
}): void;

/**
 * request method.
 */
export enum RequestMethod {
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

/**
 * @desc 用于映射请求路径中的参数.
 * 
 * @example
 * 
 *       // url: /contacts/xxx 
 * 
 *       ﹫RequestMapping({path: "/contacts/{contactname}"}) 
 *       foo(﹫PathVariable("contactname") contactname: string) { 
 *           ... 
 *       }  
 * @returns {ParameterDecorator}
 */
export function PathVariable(cfg: {
  /** 参数名 */
  name: string,
  /** 是否是必须存在的参数 */
  required?: boolean,
  /** RestController中可以指定参数的类型: String, Number, Boolean ... */
  castType?: any,
}): ParameterDecorator;

/**
 * @desc 用于映射请求中的content body.
 * 
 *  将根据 {RequestMapping} 的请求header中的Content-Type来决定body的格式化.
 * 
 *  - 如果参数类型为string, 则直接作为body, 不进行格式化
 *  - 如果参数类型为object, Content-Type:application/json, 将格式化为json.
 *  - 如果参数类型为object, Content-Type:application/x-www-form-urlencoded, 将格式化为querystring.
 *  - 如果请求类型为GET, 将格式化为querystring, 附加在url上.
 * 
 * @returns {ParameterDecorator}
 */
export function RequestBody(target: Object, propertyKey: string | symbol, parameterIndex: number): void;
export function RequestBody(cfg: {
  /** 是否是必须存在; */
  required?: boolean,
  /** (用于FeignClient中) 对body参数字符串化处理 (默认会根据content-type进行字符串化) */
  stringifyCallback?: (bodyData: any) => string,
  /** RestController中可以指定参数的类型: String, Number, Boolean ... */
  castType?: any,
}): ParameterDecorator;


/**
 * @desc 用于定义post请求.
 * 
 * @returns {MethodDecorator}
 */
export function PostMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 附加的header; (请求或响应的header) */
  headers?: LazyParameter<Rest.Headers>,
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}): MethodDecorator;

/**
 * @desc 用于定义put请求.
 * 
 * @returns {MethodDecorator}
 */
export function PutMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 附加的header; (请求或响应的header) */
  headers?: LazyParameter<Rest.Headers>,
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}): MethodDecorator;

/**
 * @desc 用于定义patch请求.
 * 
 * @returns {MethodDecorator}
 */
export function PatchMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 附加的header; (请求或响应的header) */
  headers?: LazyParameter<Rest.Headers>,
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}): MethodDecorator;

/**
 * @desc 用于定义get请求.
 * 
 * @returns {MethodDecorator}
 */
export function GetMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 附加的header; (请求或响应的header) */
  headers?: LazyParameter<Rest.Headers>,
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}): MethodDecorator;

/**
 * @desc 用于定义delete请求.
 * 
 * @returns {MethodDecorator}
 */
export function DeleteMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 附加的header; (请求或响应的header) */
  headers?: LazyParameter<Rest.Headers>,
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string|'no-cors'|'cors'|'same-origin',
  credentials?: 'include'|null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}): MethodDecorator;

/**
 * @desc 用于定义请求.
 * 
 * @returns {MethodDecorator}
 */
export function RequestMapping(cfg: {
  /** 指定请求的路径; 如果需要使用?后querystring参数, 请使用 RequestParam */
  path: string | string[],
  /** 默认为 GET */
  method?: RequestMethod,
  /** 附加的header; (请求或响应的header, 可使用Headers对象或回调方法获取headers) */
  headers?: LazyParameter<Rest.Headers>,
  /** 超时 (ms), 默认为5000 */
  timeout?: number,
  mode?: string | 'no-cors' | 'cors' | 'same-origin',
  credentials?: 'include' | null,
  /** 指定feignClient response的数据类型 */
  feignCastType?: any,
}): MethodDecorator;

/**
 * @desc 用于映射请求中的查询参数.
 * 
 * 
 * @example
 * 
 *       // url: /contacts?contactname=xxx 
 * 
 *       ﹫RequestMapping({path: "/contacts"}) 
 *       foo(﹫RequestParam("contactname") contactname: string) { 
 *           ... 
 *       } 
 * @returns {ParameterDecorator}
 */
export function RequestParam(cfg: {
  /** 参数名 */
  name: string,
  /** 是否是必须存在的参数 */
  required?: boolean,
  /** 如果参数不存在时的默认值 */
  defaultValue?: any,
  /** RestController中可以指定参数的类型: String, Number, Boolean ... */
  castType?: any,
}): ParameterDecorator;

/**
 * @desc RestObject参数类型.
 */
export type RestObjectType<T = any> = {
  /** request对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  request: fetch.Request|Rest.RestRequest;
  /** response对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  response: fetch.Response|Rest.RestResponse;
  /** 已经从response对象中读取的消息 */
  responseMsg: any;
  /** 处理过程中发生的错误 */
  error: Error;
  /** web 上下文对象; 如koa.Context等 */
  ctx: T;
};

/**
 * @desc RestObject参数类型. 用于FeignClient.
 */
export type RestObjectTypeFeign<T = any> = {
  /** request对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  request: fetch.Request;
  /** response对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  response: fetch.Response;
  /** 已经从response对象中读取的消息 */
  responseMsg: any;
  /** 处理过程中发生的错误 */
  error: Error;
  /** web 上下文对象; 如koa.Context等 */
  ctx: T;
};

/**
 * @desc RestObject参数类型. 用于FeignClient.
 */
export type RestObjectTypeRest<T = any> = {
  /** request对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  request: Rest.RestRequest;
  /** response对象; 如果在feignClient中使用类型为{fetch.Request}, 在RestController中使用类型为{Rest.RestRequest} */
  response: Rest.RestResponse;
  /** 已经从response对象中读取的消息 */
  responseMsg: any;
  /** 处理过程中发生的错误 */
  error: Error;
  /** web 上下文对象; 如koa.Context等 */
  ctx: T;
};


/**
 * @desc 用于映射请求中的Rest对象, 可以对Request,Response等内容做特殊处理.
 * 
 * @returns {ParameterDecorator}
 */
export function RestObject(target: Object, propertyKey: string | symbol, parameterIndex: number): void;
export function RestObject(): ParameterDecorator;

/**
 * @desc 表明指定的类为RestController类.
 *
 * @returns {ClassDecorator}
 */
export function RestController(cfg?: {
  /** 定义RestController类中请求的统一前缀 */
  path?: string
}): ClassDecorator;

/**
 * @desc: 设置默认的配置. 可用于全局response消息的处理等.
 */
export function setRestControllerDefaultCfg(cfg: {
  /** 日志级别. */
  logLevel?: RestLogLevel,
  /** 如果response对象中不存在对应的header, 则附加的header */
  headers?: { [key: string]: string|string[] },
  /** 处理controller处理方法返回的对象returnMessage, 并返回需要response到请求端的内容 */
  filterMessageCallback?: (returnMessage: any, requestUrl: string) => any,
  /** 接收消息时发生数据类型等错误. */
  errorRequestCallback?: (error:Error, request:Rest.RestRequest, response:Rest.RestResponse ) => void,
  /** 响应消息时发生错误. */
  errorResponseCallback?: (error:Error, request:Rest.RestRequest, response:Rest.RestResponse ) => void,
  /** 404. */
  notFoundCallback?: (request:Rest.RestRequest, response:Rest.RestResponse ) => void,
}): void;

/**
* @desc 处理请求; 
* @description 在web框架收到http请求时, 调用此接口后将会触发指定的RestController进行处理. 当匹配到一个处理后即中断后续匹配.
* @return 返回null表明未匹配到适当的router.
*/
export function CallRestControllerRoute(
  request: Rest.RestRequest,
  ctx: any,
): Promise<Rest.RestResponse>;