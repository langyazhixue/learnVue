import View from './components/view'
import Link from './components/link'

export let _Vue

// Vue-router 插件的安装
export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this // 在Vue实例上添加一个_routerRoot指向自己，即Vue实例
        this._router = this.$options.router // 在Vue实例上添加一个_router指向构造时的vue-router实例
        this._router.init(this) // 实例调用init()进行初始化，参数为Vue实例
        Vue.util.defineReactive(this, '_route', this._router.history.current) // 通过Vue的defineReactive把_router变成响应式，等于this._router.history.current
      } else {
        // this._routerRoot = (this.$parent && this.$parent._routerRoot) || this; //如果this.$options.router则设置$this._routerRoot为占位符节点的_routerRoot，这样就可以访问到vue-rooter实例了
        // 为什么所有组件实例都能访问到，因为 把 父亲的 _routerRoot 都拿过来了
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })
  // RouterView组件注册
  // RouterLink
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
