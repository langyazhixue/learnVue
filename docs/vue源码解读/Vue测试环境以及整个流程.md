# 测试环境

* 安装依赖
* 安装　rollup - npm i rollup -g
* 修改dev脚本

```javascript
"dev": "rollup -w -c build/config.js --sourcemap --environment TARGET:web-full-dev",
```

​	

* 执行dev 命令

  ```
  npm run dev
  ```

  



* 创建测试文件，引入vue.js

* ###  **入口文件** ：浏览器入口（每个入口不一样，weex入口不一样，扩展了$mount方法的行为也不一样）

  > learnVue/vue/src/platforms/web/entry-runtime-with-compiler.js

  入口文件：扩展了$mount方法：处理template和el选项，尝试编译它们为 render函数,核心作用

  * 优先级：render > tempate>el
  * tempate 可以是id选择器，也可以是dom元素

  

  > 在入口文件中我们去找到 构造vue的 文件，vue/src/platforms/web/runtime/index.js

  * 定义了$mount方法：执行挂载 mountComponent(this, el, hydrating)
  * 实现了patch 方法

  > 继续找 src/core/index.js

  *  定义全局API: initGlobalAPI(Vue)		

  ```javascript
  Vue.set = set
  
    Vue.delete = del
  
    Vue.nextTick = nextTick
  
    initUse(Vue) // 实现Vue.use函数
  
    initMixin(Vue) // 实现Vue.mixin函数
  
    initExtend(Vue) // 实现Vue.extend函数
  
    initAssetRegisters(Vue) // 注册实现Vue.component/directive/filter
  ```

  > 继续找，找到了构造函数的定义点：src/core/instance/index.js

  * Vue 构造函数定义

  

  ```javascript
  function Vue (options) {
    // 初始化
    this._init(options)
  }
  
  initMixin(Vue) // 　实现了 _init
  
  stateMixin(Vue) // 
  
  eventsMixin(Vue)
  
  lifecycleMixin(Vue)
  
  renderMixin(Vue)
  ```

  1. 初始化函数实现：initMixin(Vue)- src/core/instance/init.js 
     

  ```javascript
  functiom initMixin(Vue){
    	if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options)
      } else {
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        )
      }
  
    initLifecycle(vm) //  生命周期的初始化，初始化 $parent $root $children $refs 
  
    initEvents(vm) // 事件的初始化 // 处理父组件传递的监听器
  
    initRender(vm) // $slots $scopedSlots _c() $createElement()
  
    callHook(vm, 'beforeCreate') // 执行生命周期的钩子
  
    initInjections(vm) // resolve injections before data/props //获取注入的数据
  
    initState(vm) // 初始化组件中的　props,methods,data,computed watch
  
    initProvide(vm) // resolve provide after data/props
  
    callHook(vm, 'created') //生命周期的钩子
  }
  ```

  

  

  

