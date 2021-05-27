// Type definitions for febs

/**
 * 定义延迟参数.
 */
export type LazyParameter<T> = T | (() => T);
export type StringLazyParameter = LazyParameter<string>;
export type NumberLazyParameter = LazyParameter<number>;
export type BooleanLazyParameter = LazyParameter<boolean>;