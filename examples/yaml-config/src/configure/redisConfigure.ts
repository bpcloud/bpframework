'use strict';

import { RedisTemplate } from "@bpframework/middleware-redis";
/**
* Copyright (c) 2021 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2021-04-11 14:40
* Desc: 
*/

import { Bean, Service } from "febs-decorator";

@Service()
class RedisConfigure {

  @Bean()
  redisTemplate(): RedisTemplate {
    return new RedisTemplate('spring.redis');
  }

}
