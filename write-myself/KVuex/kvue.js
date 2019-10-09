
let Vue
function install(_vue) {
  Vue = _vue
  Vue.mixin({
    beforeCreate() {
      this.$store = this.$options.store
    }
  })
}
// 2. 实现 store
// const getters = {
//   // 就像计算属性一样，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算
//   // doneTodos: state => {
//   //   return state.todos.filter(todo => todo.done)
//   // }
// }

class Store {
  constructor(optoins = {}) {
    //  响应化处理，把 state 变成响应化数据
    this.state = new Vue({
      data: optoins.state
    })
    this.mutations = optoins.mutations || {}
    this.actions = optoins.actions || {}
    optoins.getters && this.handleGetters(optoins.getters)
  }
  // type  是 mutations 中的 函数名字, 同步
  // mutations  是一个
  commit = (type, arg) => {
    this.mutations[type](this.state, arg)
  }
  // 异步
  diapatch(type, arg) {
    this.actions[type]({
      commit: this.commit,
      state: this.state
    }, arg)
  }
  handleGetters(getters) {
    this.getters = {} // 定义this.getters
    // 遍历 getters 选项，为 this.getters 定义 property
    // 属性名就是选项中的key,只需要定义get 函数保证其只读性
    Object.keys(getters).forEach(key => {
      Object.defineProperty(this.getters, key, {
        get: () => {
          return getters[key](this.state)
        }
      })
    })
  }
}
export {
  Store,
  install
}