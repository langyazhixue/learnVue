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

initMixin(Vue) // 定义_init函数
stateMixin(Vue) // $props $data $set $delete $watch 状态有关的实现
eventsMixin(Vue) // $on $emit $once $off 有关的实现
lifecycleMixin(Vue) // _update $forceUpdate $destory
renderMixin(Vue) // $nextTick _render

export default Vue
