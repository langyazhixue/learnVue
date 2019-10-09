// Kvue 类：
// 1. 对传入data对象执行响应化处理
class KVue {
  constructor(options) {
    // 保存下选项
    this.$options = options
    // 保存data
    this.$data = options.data
    // 对 传入 data 对象 进行相应化处理
    this.observe(this.$data)
    // 配置一个代理
    // new Watcher (this,'test')
    // this.test; // 读取属性，触发收集
    new Compile(options.el, this)
  }

  observe(value) {
    // 一定要是对象，只有对象才能定义相应化
    if (!value || typeof value !== 'object') {
      return
    }
    Object.keys(value).forEach(key => {
      // 定义响应化处理
      this.defineReactive(value, key, value[key])
       // 执行代理
       this.proxyData(key)
    })

  }

  defineReactive(obj, key, val) {
    // 递归判断
    if(typeof val === 'object') {
      this.observe(val)
      return 
    }

    // 创建 Dep, 它跟 key 1:1 关系
    const dep = new Dep();

    // 定义属性
    // 参数 3 是 属性描述符，定义配置，遍历性
    Object.defineProperty(obj, key, {
      get() {
        // 将 Dep.target (即当前的Watcher对象存入Dep的deps中)
        Dep.target && dep.addDep(Dep.target);
        return val // 变量在外面用到，是个必包，有值发生变化的时候，🇬应该更新 //组件写在卸载调的话，会把局部变量都卸载掉
      },
      set(newVal) {
        if (newVal === val) {
          return
        }
        // 在 set 的时候触发dep的notify来通知所有的watcher对象更新视图
        val = newVal //  必包
        dep.notify()
        console.log(key + '变化', val, ' -> ', newVal)
      }
    })
  }

  proxyData(key) {
    // 向 Vue 实例上去定义属性 key
    // this 指的是 实例
    Object.defineProperty(this, key, {
      get(){
        return this.$data[key]
      },
      set(newVal){
        this.$data[key] = newVal
      }
    })
  }
}


// Dep: 管理若干Watcher 实例，通知它们更新

class Dep {
  constructor(){
    this.deps = []
  }

  addDep(dep) {
    this.deps.push(dep)
  }

  notify(){
    //  set函数调用
    this.deps.forEach(dep => dep.update())
  }
}


// watcher:执行具体的更新操作

class Watcher {
  // 得知道是跟哪个实例相关联，还有哪个key
  constructor(vm,key,updater){
    
    this.vm = vm
    this.key = key
    this.updater = updater // 有个更新函数
    Dep.target = this // 依赖收集时候要用到 // Dep 的静态属性
    this.vm[this.key] //  自己访问一次，触发收集
    Dep.target = null 
  }

  update(){
    console.log(this.vm[this.key])
    debugger
    this.updater.call(this.vm,this.vm[this.key])
    console.log(`属性${this.key}更新了1`)
  }
}