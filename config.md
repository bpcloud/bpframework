- [SpringCloudConfig](#springcloudconfig)
- [Nacos](#nacos)
- [FeignClient load balancing](#feignclient-load-balancing)
- [Request Logging Level](#request-logging-level)

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