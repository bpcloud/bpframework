
import * as bp from './struct.d';

/**
 * 定义feignClient相关配置.
 * 
 * @example
 *    ﹫Service
 *    class Configure {
 *      ﹫FeignClientConfigure
 *      onFeignClient(): bp.FeignClientConfigureInfo {
 *      }
 *    }
 */
export function FeignClientConfigure(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;



/**
 * 定义服务发现处理方法; 使用此方法替换系统内部默认的方法.
 * 
 * @example
 *    ﹫Service
 *    class Configure {
 *      ﹫FindMicroserviceConfigure
 *      onFindMicroservice(serviceName: string, excludeHost: string): Promise<ServiceInfo> {
 *      }
 *    }
 * @param cfg cron,fixedDelay,fixedRate必须且仅使用一种.
 */
export function FindMicroserviceConfigure(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;


/**
 * 定义RestController相关配置.
 * 
 * @example
 *    ﹫Service
 *    class Configure {
 *      ﹫RestControllerConfigure
 *      onRestController(): bp.RestControllerConfigureInfo {
 *      }
 *    }
 */
export function RestControllerConfigure(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;


/**
* @desc 应用配置加载完成事件.
*/
export interface ContextRefreshedEvent {
  /**
   * 所有配置
   */
  configs: bp.ImmutableConfigMap;
}

/**
 * 本地配置加载完成, 系统service对象初始化完成的事件监听.
 * 
 * @example
 * 
 *    class Demo {
 *      ﹫ContextRefreshedEventListener
 *      onContextRefreshed(ev: ContextRefreshedEvent): Promise<void> {
 *      }
 *    }
 */
export function ContextRefreshedEventListener(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;


/**
* @desc 远程配置刷新事件.
*/
export interface RefreshRemoteEvent {
  /**
   * 改变的配置.
   */
  updatedConfigs: bp.ImmutableConfigMap;
  /**
   * 最新的所有配置
   */
  latestConfigs: bp.ImmutableConfigMap;
}

/**
 * 定义远程配置刷新的事件监听.
 * 
 * @example
 * 
 *    class Demo {
 *      ﹫RefreshRemoteEventListener
 *      onRefreshRemoteEvent(ev: RefreshRemoteEvent): Promise<void> {
 *      }
 *    }
 */
export function RefreshRemoteEventListener(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;

/**
* @desc 实例注册到注册中心的事件.
*/
export interface InstanceRegisteredEvent{
}

/**
 * 实例注册到注册中心的事件监听.
 * 
 * @example
 * 
 *    class Demo {
 *      ﹫InstanceRegisteredEventListener
 *      onEvent(ev: InstanceRegisteredEvent): Promise<void> {
 *      }
 *    }
 */
export function InstanceRegisteredEventListener(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;

/**
 * 定义定时任务. 修饰的方法必须返回 Promise
 * 
 * @example
 * 
 *    class Task {
 *      // 返回false则停止任务.
 *      ﹫Scheduled()
 *      onScheduled(): Promise<false|any>|false|any {
 *      }
 *    }
 * @param cfg cron,fixedDelay,fixedRate必须且仅使用一种.
 */
export function Scheduled(cfg: {
  /** task执行的间隔时间 (按照crontask间隔时间格式指定, 例如: * 0 * * * *) */
  cron?: string,
  /** 指定一个task结束后到下一次task开始的固定间隔; milliseconds */
  fixedDelay?: number,
  /** 指定两次task执行的固定间隔, 此间隔时间包含task的执行时间, 如果执行时间超过fixedRate, 则task结束时立即执行下一次task; milliseconds */
  fixedRate?: number,
  /** 首次执行task需要等待的时间; milliseconds */
  initialDelay?: number,
}): MethodDecorator;

/**
 * 定义Application.
 * 
 * @example
 *    ﹫BpApplication()
 *    class App{
        main() {
          Application.runKoa({
            app: koajs.createApp(),
          });
        }
 *    }
 */
export function BpApplication(): ClassDecorator;