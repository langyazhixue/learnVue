import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 初始化
  this._init(options)
}

initMixin(Vue) // 实现了 _init
stateMixin(Vue) // 实现了 $props,$watch,$data,$set
eventsMixin(Vue) // $on,$emit,$once,$off
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
