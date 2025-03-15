<font color=red>This project is still in development</font>

- [Setup.](#setup)
- [Example.](#example)
- [Feature.](#feature)
- [Configure.](#configure)
  - [@FindMicroserviceConfigure](#findmicroserviceconfigure)
  - [@RestControllerConfigure](#restcontrollerconfigure)
  - [@IgnoreRestLogger](#ignorerestlogger)
  - [@FeignClientConfigure](#feignclientconfigure)
  - [@Value](#value)
- [Middleware.](#middleware)
- [Event Listener.](#event-listener)
  - [@ContextRefreshedEventListener](#contextrefreshedeventlistener)
  - [@RefreshRemoteEventListener](#refreshremoteeventlistener)
  - [@InstanceRegisteredEventListener](#instanceregisteredeventlistener)
- [Scheduling](#scheduling)
  - [@Scheduled](#scheduled)
- [Bean](#bean)
  - [@Service](#service)
  - [@Bean](#bean-1)
  - [@Autowired](#autowired)
  - [@Value](#value-1)

## Setup.

use cli to create a project.

```bash
npm i bpframework-cli -g
```

create a project.

```bash
bpframework init
```

## Example.

see directory [./examples](./examples)

## Feature.

| feature     | supports                           |
| ----------- | ---------------------------------- |
| config      | bootstrap.yml<br>SpringCloudConfig |
| discovery   | nacos                              |
| scheduling  | @Scheduled                         |
| api routers | @RestController                    |

## Configure.

The appropriate configuration is required to enable the corresponding feature: [config](./config.md)

| name                                                    | description                           |
| ------------------------------------------------------- | ------------------------------------- |
| [FindMicroserviceConfigure](#findmicroserviceconfigure) | 定义自定义的服务发现处理方法          |
| [FeignClientConfigure](#feignclientconfigure)           | 定义FeignClient的默认headers等信息    |
| [RestControllerConfigure](#restcontrollerconfigure)     | 定义RestController的默认headers等信息 |


### @FindMicroserviceConfigure

By default, nacos is used to find micro-service; You can customize it by `@FindMicroserviceConfigure`.

```js
@Service()
class Configure {
  @FindMicroserviceConfigure
  async onFindMicroservice(serviceName: string, excludeHost: string): Promise<ServiceInfo> {
    return {
      ip,
      port,
      serviceName,
      metadata,
    }
  }
}
```

### @RestControllerConfigure

定义RestController的默认headers等信息, 使用如下方式.

```js
@Service()
class Configure {
  @RestControllerConfigure
  onConfigure(): bp.RestControllerConfigureInfo {
    return {
      defaultHeaders: {'content-type': 'application/json;charset=utf-8'},
    }
  }
}
```

### @IgnoreRestLogger

用于忽略rest请求的日志, 使用如下方式.

```js
@RestController({ path: '/api' })
class Rest {
  @IgnoreRestLogger
  @RequestMapping({ path: '/url', method: RequestMethod.GET })
  async request(
    @RestObject obj: RestObjectTypeRest<koa.Context> // or RestObjectType
  ): Promise<ListRolesRequest> {
    ...
  }
}
```

### @FeignClientConfigure

定义FeignClient的默认headers等信息, 使用如下方式.

```js
@Service()
class Configure {
  @FeignClientConfigure
  onConfigure(): bp.FeignClientConfigureInfo {
    return {
      defaultHeaders: {'content-type': 'application/json;charset=utf-8'},
      /**
       * 对每次请求后接收的消息进行过滤.
       */
      filterResponseCallback: (data: FeignClientFilterResponseData) => {
        
      },
      /**
       * Processing the data of the request.
       */
      filterRequestCallback: (data: FeignClientFilterRequestData, feignData: FeignDataType) => {

      }
    }
  }
}
```

### @Value

使用 @Value 注解设置初始值或获取配置值.

```js
@Service()
class Demo {
  @Value("Miss A")
  teacher1Name: string; // will set to 'Miss A'

  @Value("${teacherName2}")
  teacher2Name: string; // will set to config value "teacherName2"

  @Value("${teacherName3:defaultName}")
  teacher3Name: string; // will set to 'defaultName' if config value "teacherName3" isn't existed.
}
```

## Middleware.

see https://github.com/bpcloud/middleware.git

## Event Listener.

| name                                                                | description                                 |
| ------------------------------------------------------------------- | ------------------------------------------- |
| [ContextRefreshedEventListener](#ContextRefreshedEventListener)     | 本地配置加载完成, 系统service对象初始化完成 |
| [RefreshRemoteEventListener](#RefreshRemoteEventListener)           | 远程配置动态刷新事件                        |
| [InstanceRegisteredEventListener](#InstanceRegisteredEventListener) | 实例注册到注册中心后的事件                  |

### @ContextRefreshedEventListener

本地配置加载完成, 系统service对象初始化完成.

```js
@Service()
class ApplicationEvent {
  @ContextRefreshedEventListener
  async onContextRefreshed(ev:ContextRefreshedEvent):void {

  }
}
```

### @RefreshRemoteEventListener

远程配置动态刷新事件.

```js
@Service()
class ApplicationEvent {
  @RefreshRemoteEventListener
  async onRefreshRemote(ev:RefreshRemoteEvent):void {

  }
}
```

### @InstanceRegisteredEventListener

实例注册到注册中心后的事件.

```js
@Service()
class ApplicationEvent {
  @InstanceRegisteredEventListener
  async onInstanceRegistered(ev:InstanceRegisteredEvent):void {
    
  }
}
```

## Scheduling

### @Scheduled

全局启动scheduled

```js
global.__enableScheduled = true;
```

使用此注解可以开启一个定时任务.

```js
@Service()
class Demo {
  @Scheduled({cron:'* * * * * *'})
  async onTick(): Promise<false|void> {
    return false; // 返回false则表明停止此task.
  }
}
```

- Start task:  当类实例被创建后, task即按照时间间隔运行
- Stop task: 当@Scheduled修饰的方法明确返回false时, task将停止

## Bean

### @Service

可以使用此注解实例化对象

```js

/**
 * 加载所有的bean, 并进行实例化等操作.
 */
export function finishBeans(): Promise<void>;

/**
* @desc 获得已装配完的指定类型的service.
*/
export function getServiceInstances(key: any): ServiceInstanceType;

/**
 * 无需等待执行 finishBeans().
 * 
 * @returns {ClassDecorator}
 */
export function ImmediatelyService(name: string): ClassDecorator;
export function ImmediatelyService(cfg?: { singleton?: boolean, name?: string }): ClassDecorator;

/**
 * @desc 表明指定的类为Service类.
 * 
 * 定义为Service的类, 在源文件被引用后, 单例bean将会自动在全局创建一个实例.
 * 
 * @description 
 *  `Service` 与 `Bean` 都是延迟注入类型; 需要在 `finishBeans()` 方法调用之后才能够生效.
 *  需实现立即生效类型使用 `ImmediatelyService`
 * 
 * @param cfg.singleton 是否为单例; (默认单例)
 * @param cfg.name      使用名称注入; 如不使用名称,则使用类型注入.
 *
 * @returns {ClassDecorator}
 */
export function Service(name: string): ClassDecorator;
export function Service(cfg?: { singleton?: boolean, name?: string }): ClassDecorator;
```

示例：

```js
/**
 * 在app初始化完成后将自动实例化.
 */
@Service()
class Example {
  constructor() {}
}

/**
 * 立即自动实例化.
 */
@ImmediatelyService()
class Example {
  constructor() {}
}
```

### @Bean

```js

/**
 * @desc 表明指定的属性为Bean.
 * 
 * <Bean修饰的方法不允许带参数, 并且返回的类型作为注入对象的类型.>
 * 定义为Bean, 在源文件被引用后, 单例bean将会自动在全局创建一个实例.
 * 
 * @description 
 *  `Service` 与 `Bean` 都是延迟注入类型; 需要在 `finishBeans()` 方法调用之后才能够生效.
 *  需实现立即生效类型使用 `ImmediatelyService`
 * 
 * @param cfg.singleton 是否为单例; (默认单例)
 * @param cfg.name      使用名称注入; 如不使用名称,则使用方法名注入.
 * 
 * @example
 * 
 * ﹫Service()
 * class {
 *       ﹫Bean() 
 *       foo(): Object { 
 *           return {};
 *       }
 * 
 *       ﹫Autowired('foo')
 *       private obj: Object;
 * }
 * @returns {PropertyDecorator}
 */
export function Bean(name: string): MethodDecorator;
export function Bean(cfg?: { singleton?: boolean, name?: string }): MethodDecorator;
```


### @Autowired


```js
/**
 * @desc 表明指定的属性可以自动装载指定的Service实例.
 * 
 * @example
 *  ﹫Autowired(ClassA)
 *  obj: ClassA;  // will to auto create object.
 * 
 * @returns {PropertyDecorator}
 */
export function Autowired(type: Function|string): PropertyDecorator;
```

### @Value

```js
/**
 * @desc 表明指定的属性可以自动装载指定的值.
 * @description 无需添加 RefreshScope 注解; 在配置刷新时会自动变更值.
 * @example
 *   ﹫Service()
 *   class Demo {
 *     ﹫Value("Miss A")
 *     teacher1Name: string; // will set to 'Miss A'
 * 
 *     ﹫Value("${teacherName2}")
 *     teacher2Name: string; // will set to config value "teacherName2"
 * 
 *     ﹫Value("${teacherName3:defaultName}")
 *     teacher3Name: string; // will set to 'defaultName' if config value "teacherName3" isn't existed.
 *   }
 * 
 * @returns {PropertyDecorator}
 */

export function Value(value: any): PropertyDecorator;
```