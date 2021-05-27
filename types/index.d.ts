
export * from './struct.d';
export * from './Application.d';
export * from './Logger.d';
export * from './decorators.d';
export * from './mq.d';
export * from './lazyParameter.d';

export * from './springframework/bean_annotation.d';
export * from './springframework/rest_request.d';
export * from './springframework/rest.d';
export * from './springframework/service.d';

declare global {
  /**
  * @desc: 如果开启; 在FeignClient配置中url优先生效, 否则url不生效.
  */
  var __debugFeignClient: boolean;
  /**
  * @desc: To enable scheduled
  */
  var __enableScheduled: boolean;
}