## Vue 输出格式说明

​		dist目录下

* Vue-common.js - cjs-(webpack1)（node端也可以用）
* vue.esm.js - es6(webpack2+)（在webpack工程中就用这种）
* Vue.js- umd格式（兼容cjs和amd）(在浏览器中直接使用就用这个)（node端也可以用）
* vue.esm.browser.js(浏览器专用模式)
* Runtime 仅包含运行时，没有编译器

在用webpack4+开发的时候，其实用的是 module 中对应的 dist/vue.runtime.esm.js，vue-loader 就是一个编译器

* Webpack-resolve-mainFields - 默认值是["browser", "module", "main"]
* webpack  模块解析规则：https://www.webpackjs.com/concepts/module-resolution/#webpack-%E4%B8%AD%E7%9A%84%E8%A7%A3%E6%9E%90%E8%A7%84%E5%88%99

```javascript
import Vue from 'vue'
```

![image-20201026141130736](/Users/jiaxiaoxiao/Library/Application Support/typora-user-images/image-20201026141130736.png)





**在学习源码的时候，用 dist/vue.js(要带编译器)**



