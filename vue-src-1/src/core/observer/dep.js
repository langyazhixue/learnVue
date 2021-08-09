/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    // 实例化多少个Dep,id 就要增加
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      // Dep.target = Watcher 实例
      // 把dep 自己add 到 watcher中去
      // watcher 跟 dep 是多对多的关系
      Dep.target.addDep(this)
    }
  }
  // 通知更新
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      // a.id - b.id < 0 则不交换位置，升序
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  // targetStack 目标栈加入新目标，修改 Dep.target
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
   // targetStack 目标栈删除并返回数组的最后一个元素，修改 Dep.target 为目前数组的最后一个
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
