export type KeyMap<V> = { [key: string]: V }
export type ImmutableKeyMap<V> = { readonly [key: string]: V }

/** Mutable config map */
export type ConfigMap = KeyMap<any>
/** Immutable config map */
export type ImmutableConfigMap = ImmutableKeyMap<any>