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

  入口文件：扩展了$mount方法：处理template和el选项，尝试编译它们为 render函数

  * 优先级：render > tempate>el
  * tempate 可以是id选择器，也可以是dom元素

  

  > vue/src/platforms/web/runtime/index.js

  * 定义了$mount方法：执行挂载 mountComponent(this, el, hydrating)
  * 实现了patch 方法

  