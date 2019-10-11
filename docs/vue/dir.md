# 文件结构以及调试环境搭建

### 获取 Vue

项目地址：[https://github.com/vuejs/vue](https://github.com/vuejs/vue)

迁出项目: git clone https://github.com/vuejs/vue

当前版本号：2.6.10

### 文件结构

* `dist` 中 是打包好的最终的文件
  输出格式说明
    * 包含`common`关键词，是为老版本的打包器准备的（比方说webpack1，)，导出方式 `cjs` (require 导入)
    * 包含`esm`关键词,是为现代打包器准备的（比方说webpack2以及以上),导出方式 `ejs` ( import 导入)
    * 即不包含`common`，也不包含 `esm`，是 `umd` 格式，兼容了 `cjs` 和 `amd` 方式，(vue.js 这个)
    * 包含runtime 仅包含运行时候,没有编译器，这个一般在我们项目中用的最多，因为项目中已经用`vue-loader`进行预编译了 

* `example` 中 有 一些测试代码

* `flow` 中 是一些类型声明，v2.0 是用 flow 写的， v3.0 就用 ts 写了

* `packages` 是独立于vue核心代码块的东西，像服务端渲染以及weex的东西

* `scripts` 是打包脚本

* `src`中是最重要的源码
  * compiler 是 编译器的代码
  * core 核心代码
  * platforms 中是 平台特殊的代码 (web, weex)
  * server 是 服务端的代码
  * sfc 是单文件的解析器
  * shared 是公共的帮助代码* 

* `test` 是测试代码

* `types` 因为 源码是用 flow 写的，所以得为 ts 专门写一套


### 调试环境搭建

* 安装依赖： npm i
* 安装 rollup: npm i  -g rollup
* 修改 dev 脚本，添加 sourcemap, package.json

```js
"dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev"
```
* 运行开发命令: npm run dev

引入前面创建的vue.js，samples/commits/index.html

```html
<script src='../../dist/vue.js'></script>
```
接下来可以在浏览器愉快的调试代码了!


### 找到入口文件

package.json, main 用于 browserify、webpack 1, module 用于 webpack 2 

```js
"main": "dist/vue.runtime.common.js",
"module": "dist/vue.runtime.esm.js",
```
dev脚本中 -c scripts/config.js 指明配置文件所在 参数 TARGET:web-full-dev 指明输出文件配置项，line:123

```js
// Runtime+compiler development build (Browser)
'web-full-dev': {
  entry: resolve('web/entry-runtime-with-compiler.js'), // 入口 dest: resolve('dist/vue.js'),// 目标文件
  format: 'umd', // 输出规范
  env: 'development',
  alias: { he: './entity-decoder' },
  banner
}
```

#### 入口文件就是 vue-src/src/platforms/web/entry-runtime-with-compiler.js
  1. 覆盖了$mount,处理template和el选项，尝试编译它们为render函数 核心作用

在入口文件中我们去找到 构造vue的 文件，vue-src/src/platforms/web/runtime/index.js
 1. 定义了$mount方法， 执行了 mountComponent 方法
 2. vue 实现 __patch__ 函数(this, el, hydrating)

#### 继续找 src/core/index.js
  1. 定义全局API
  
  ```js
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
  initUse(Vue) // 实现Vue.use函数
  initMixin(Vue) // 实现Vue.mixin函数
  initExtend(Vue) // 实现Vue.extend函数
  initAssetRegisters(Vue) // 注册实现Vue.component/directive/filter

  ```

#### 继续找，找到了构造函数的定义点：src/core/instance/index.js
 1. Vue 构造函数定义
```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 初始化
  this._init(options)
}

initMixin(Vue) // 　实现了 _init
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```

*  initMixin：在 vue-src/src/core/instance/init.js 

初始化函数的实现

```js
initLifecycle(vm) // $parent, $root,$children,$refs
initEvents(vm) 
initRender(vm)
callHook(vm, 'beforeCreate') // 在 beforeCreate 没有 props 、 methods 、 data 、 computed、watch
initInjections(vm) // 获取注入数据
initState(vm) // 初始化组件中props 、 methods 、 data 、 computed、watch
initProvide(vm) // 提供数据
callHook(vm, 'created') // 在

```

整个流程思维导图[Vue源码](https://processon.com/mindmap/5da02357e4b06b7d6ec79cde)