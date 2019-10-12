/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

// 定义了7个方法，在vue中对这7个方法做了拦截
// vue中还没有对数组索引进行拦截
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 拦截，添加额外方法
  // arrayMethods 
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 执行原先任务
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    // 以下3个操作需要额外的响应化处理
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 对新进来的元素进行响应化处理
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 执行通知更新
    ob.dep.notify()
    return result
  })

})
