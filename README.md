<font color=red>This project is still in development</font>

- [Setup.](#setup)
- [Example.](#example)
- [Feature.](#feature)
- [Configure.](#configure)
  - [@FindMicroserviceConfigure](#findmicroserviceconfigure)
  - [@RestControllerConfigure](#restcontrollerconfigure)
  - [@FeignClientConfigure](#feignclientconfigure)
  - [@Value](#value)
- [Middleware.](#middleware)
- [Event Listener.](#event-listener)
  - [@ContextRefreshedEventListener](#contextrefreshedeventlistener)
  - [@RefreshRemoteEventListener](#refreshremoteeventlistener)
  - [@InstanceRegisteredEventListener](#instanceregisteredeventlistener)
- [Scheduling](#scheduling)
  - [@Scheduled](#scheduled)

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

