// Type definitions for febs

/// <reference types="node" />


export type ServiceInstanceType = { singleton: boolean, instance: any, callback: () => Promise<any> };

/**
 * 加载所有的bean, 并进行实例化等操作.
 */
export function finishBeans(): Promise<void>;

/**
* @desc 获得已装配完的指定类型的service.
*/
export function getServiceInstances(key: any): ServiceInstanceType;

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

/**
 * 无需等待执行 finishBeans().
 * 
 * @returns {ClassDecorator}
 */
export function ImmediatelyService(name: string): ClassDecorator;
export function ImmediatelyService(cfg?: { singleton?: boolean, name?: string }): ClassDecorator;

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