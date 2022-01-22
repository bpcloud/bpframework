- [Application information](#application-information)
- [SpringCloudConfig](#springcloudconfig)
- [Nacos](#nacos)
- [FeignClient load balancing](#feignclient-load-balancing)
- [Request Logging Level](#request-logging-level)

## Application information

The default configure file is:
- `./resource/bootstrap.yml`
- `./resource/application.yml`

The file ‘application.yml’ can be automatically replaced with `application-{profile}.yml`;

‘application.yml’ will be used if ‘application-{profile}.yml’ does not exist

```properties
server:
  port: 8080  # It will be ignored when multiple modules are started concurrently

spring:
  application:
    name: appName
  profiles:
    active: dev   # Alternatives can use environment variables:
                  # `bpframework_active_profile`
```

## SpringCloudConfig

Using SpringCloudConfig requires the following configuration:

```properties
spring:
  cloud:
    config:
      uri: http://127.0.0.1    # Config center uri
      label: dev
      profile: dev
      retry:
        max-attempts: 6        # Maximum number of retries
        multiplier: 1.1        # Interval multiplier
        initial-interval: 1000 # Initial retry interval
        max-interval: 2000     # Maximum retry interval
      token: xxxxxx            # Config center token.
  # config bus.
  rabbitmq:
    username: username
    password: password
    host: host
    port: port
    virtual-host: /
```

Bus id =

```
${vcap.application.name:${spring.application.name:application}}:${vcap.application.instance_index:${spring.application.index:${local.server.port:${server.port:0}}}}:${vcap.application.instance_id:${random.value}}
```

Can change `spring.rabbitmq` configure location:

```js
Application.runKoa({ springCloudBusConfigurePrefix: 'spring.rabbitmq1' })
```


## Nacos


Using Nacos requires the following configuration:

```properties
spring.application.name:  serviceName
spring.cloud.nacos.discovery:
  ip        : 127.0.0.1         # IP registered for the service.
  port      : 8080              # Port registered for the service.
  serverAddr: 127.0.0.1/nacos   # Nacos server host.
  namespace : xxxx              # Namespace
  secure    : false             # Nacos server host is ssh. 
```

## FeignClient load balancing 

```properties
ribbon:
  ReadTimeout: 20000
  MaxAutoRetriesNextServer: 2
  MaxAutoRetries: 1
```

## Request Logging Level

```properties
bp:
  # feign client log.
  feignLoggingLevel: full
  # restController log.
  restControllerLoggingLevel: full
```

- `none`: no logging
- `basic`: Log only the request method and URL and the response status code and execution time
- `headers`: Log the basic information along with request and response headers 
- `full`: Log the headers, body, and metadata for both requests and responses