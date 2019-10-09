// vue-router 源码实现  思路
// 1. 路由配置解析
// 2. 路由挂载
// 3. 路由出口：一个地址对应一个组件
// 4. 路由监听：当 url改变的时候，组件渲染相应的改变
let Vue
class KRouter {
  // 1. 解析route 配置，生成 map
  constructor(options) {
    this.options = options
    this.routerMap = {

    }
    // url响应处理,只要 url 变化，用到url 的组件就会重新render
    // vue-router 跟 Vue 强耦合，只能用于vue
    this.app = new Vue({
      data: {
        current: '/'
      }
    })
  }

  // 声明初始化函数
  init() {
    // 1. 事件监听
    this.bindEvents()
    // 2. 路由映射操作
    this.createRouteMap()
    // 组件声明和注册
    this.initComponent()
  }

  // 路由映射操作
  createRouteMap() {
    this.$options.routes.forEach(item => {
      this.routerMap[item.path] = item
    })
  }
  initComponent() {
    Vue.component('router-link', {
      props: {
        to: {
          type: String,
          default: '/'
        }
      },
      render(h) {
        // h(tag, data, children)
        return h('a',
          {
            attrs: {
              href: '#' + this.to
            }
          },
          [this.$slots.default]
        )
        // return <a href={this.to}>{this.$slots.default}</a>
      }
    })

    Vue.component('router-view', {
      props: {
        to: {
          type: String,
          default: '/'
        }
      },
      render: (h) => {
        // h(tag, data, children)
        // 拿出要渲染的组件
        // this 希望是 Router 实例
        const component = this.routerMap(this.app.current).component
        return h(component)
      }
    })
  }
  // 监听事件
  // hashchange
  bindEvents() {
    window.addEventListener('hashchange', this.onHashChange.bind(this))
    // 件套
    window.addEventListener('load', this.onHashChange.bind(this))
  }

  onHashChange() {
    // #/index
    console.log(window.location.hash)
    this.app.current = window.location.hash.slice(1) || '/'
  }
}

// 插件接受Vue构造函数
KRouter.install = function(_vue) {
  Vue = _vue // 保存 Vue 构造函数
  console.log(this)
  // 混入：执行挂载操作
  Vue.mixin({
    beforeCreate() {
      // 只有根组件执行一次 实例存在后才会执行
      if (this.$options.router) {
        // 这里 this 是 实例
        Vue.prototype.$router = this.$options.router
        this.$options.router.init()
      }
    }
  })
}
export default KRouter
