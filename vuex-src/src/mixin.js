export default function (Vue) {
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    // 在 befreCreate 中 安装 Vuex
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    const _init = Vue.prototype._init
    // 在 prototype init 方法 上 去
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    const options = this.$options
    // store injection
    // 拿到 options 中的方法
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
        //如果options.store不存在，但是父实例存在$store(组件的情况下)
        // 则设置this.$store为父实例的$store
        this.$store = options.parent.$store;                      
    } else if (options.parent && options.parent.$store) {
      // 用 options.parent parent 向下传递
      this.$store = options.parent.$store
    }
  }
}
