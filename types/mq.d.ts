export namespace rabbitmq {
  enum ExchangeType {
    direct = 'direct',
    topic = 'topic',
    headers = 'headers',
    fanout = 'fanout',
  }

  class SubscribeConnect {
    /** 关闭订阅 */
    close(): void
  }

  class SubscribeCfg {
    /** 连接地址: amqp://xxxxx */
    url: string
    /** 心跳秒数: 10 */
    heartbeat?: number
    /** 重连的毫秒数: 10000 */
    reconnect?: number

    /** exchange 配置 */
    exchangeCfg: {
      exchangeName: string
      exchangeType: ExchangeType
      durable?: boolean
      autoDelete?: boolean
    }

    /** queue 配置 */
    queueCfg: {
      /** 如果指定空队列名称, 将创建一个随机队列 */
      queueName?: string
      /** topic, routing key 等. */
      queuePattern?: string
      exclusive?: boolean
      durable?: boolean
      autoDelete?: boolean
      deadLetterExchange?: string
      deadLetterRoutingKey?: string
      /**
       * additional arguments, usually parameters for some kind of broker-specific extension e.g., high availability, TTL
       * 
       * RabbitMQ extensions can also be supplied as options. These typically require non-standard x-* keys and values, sent in the arguments table; e.g., 'x-expires'. When supplied in options, the x- prefix for the key is removed; e.g., 'expires'. Values supplied in options will overwrite any analogous field you put in options.arguments.
       */
      arguments?: any,
    }
  }


  /**
  * @desc: 订阅连接消息队列.
  * @return: Promise
  */
  function subscribe(opt: SubscribeCfg): Promise<SubscribeConnect>;

  /**
   * 获取一个消息.
   * @param conn 
   */
  function consumeMessage(conn: SubscribeConnect, cb: (err: Error, msg: string) => void): void;
  function consumeMessage(conn: SubscribeConnect): Promise<string>;
}
