在定义数据表时, 允许传递如下配置:

```js
{
  cacheTable?:boolean,  // 是否缓存此表; 如果缓存, 将会在更新操作后同时清空cache. (默认false)
  cacheDB?:cache,       // 用于进行cache操作的对象. (默认null)
}
```

- (以下字段必选) 将自动创建如下字段
  - is_delete:bit 字段来标记假删除.
  - created_at:date 字段来标记创建时间
  - created_by:ID 字段来标记创建者id
  - updated_at:date 字段来标记更新时间
  - updated_by:ID 字段来标记更新者id

- (以下字段可选) 如果指定了如下字段, 有特殊使用意义
  - is_forbid:bit 字段; 标记是否禁止 (影响 isAvailable)
  - tick:bigint 字段; 每次update会自动+1

## 对外的接口

访问 `ITablebase` 的接口来操作数据表.

- count
- add
- remove
- update
- exist
- select:       查询数据 (is_delete=1 数据不参与查询)
- selectContainDel:    查询数据 (is_delete=1 数据参与查询)
- selectById:   优先查询缓存
- selectTop
- isAvailable
- makeAvailableCondition
- setForbid:    如果存在 is_forbid 字段则进行设置.


其中 addItem, updateItem, updateItemById 三个接口需要自行实现.

# 缓存

数据表提供如下缓存相关的方法.

- _setCache:   设置缓存.
- clearCache:  清理缓存
- getCache:    获取缓存.
- _serialize:   用于缓存的数据序列化.
- _deserialize: 用于缓存的数据反序列化.


## cache

自动的缓存托管方式; 在查询更新时会更新缓存信息; 在缓存失效前,再次查询,将从缓存中查询.

使用 {`cacheDB`:true} 创建数据表后, 数据表底层就自动进行了cache; cache目前使用`ioredis`+`redlock`;

cache相关的操作, 需要指定具体的数据id, 如下的方法会自动进行cache更新:

- selectById
- setForbid
- removeById
- updateById

> 如果使用了cache, 在操作 update, remove 后应当注意更新相应数据的缓存.

> cache类中存在几个 db_multi, db_exec, db_discard的方法, 用于在rdb数据库中处理双事务.

## 双写一致性事务.

在rdb数据库事务中执行redis, 可以按如下的方式进行. (未考虑启动独立线程进行数据清理)

```js
let retdb = await this.db.transaction(database.isolationLevel.Repeatable_read, async (db:Database):Promise<boolean> => {

   // 创建redis事务.
   let cacheMutli = cacheObj.db_get_multi_trans(db);

   // 事务执行语句.
   cacheMutli.set(...)
             .set(...);

   return true; // 在数据库事务返回 true时, 将会提交 redis事务.
},
(db)=>cacheObj.db_multi(db),  // 增加三个redis事务处理方法.
(db)=>cacheObj.db_exec(db),
(db)=>cacheObj.db_discard(db));

```