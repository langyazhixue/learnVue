// 编译 compile
// 核心任务
// 1. 获取并遍历 DOM 树
// 2. 文本节点：获取{{}} 格式的内容并解析
// 元素节点：访问节点特性，截获k-和@开头内容并解析
// new Compile('#app', vm) // 
class Compile {
  constructor(el, vm) {
    this.$vm = vm
    this.$el = document.querySelector(el)
    if(this.$el) {
      // 执行编译
      // 编译的结果放回到el 中
      this.compile(this.$el)
    }
  }

  compile(el) {
    // 遍历
    const  childNodes = el.childNodes
    console.log(childNodes)
    // 每次拿出一个 dom节点
    Array.from(childNodes).forEach(node => {
      // 判断节点类型
      if(this.isElement(node)) {
        // 1. 元素节点:访问节点特性，截获k- 和 @ 开头内容并解析
        console.log('编译元素' + node.nodeName)
        this.compileElement(node)
      } else if(this.isInter(node)) {
        // 文本节点:获取{{}} 格式的内容并解析
        console.log('编译插值文本' + node.textContent)
        this.compileText(node)
      }
      // 递归
      if(node.childNodes && node.childNodes.length > 0) {
        console.log('进入递归')
        this.compile(node)
      }
    })
  }
  isElement(node) {
    // 判断是是否是元素节点
    return node.nodeType === 1
  }
  // 判断是否是插值表达式
  isInter(node) {
    // 判断是否有{{}}
    return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
  compileText(node) {
    // 获取表达式
    // {{ a + b }}
    const exp = RegExp.$1
    this.update(node, exp ,'text')
    //  创建
  }
  isDirective(attr) {
    return attr.indexOf("k-") == 0;
  }
  isEventDirective(arrt) {
    return arrt.indexOf('@') ===0
  }
  compileElement(node) {
    // 截获k-和@开头内容并解析
    // k-text
    // k-html
    // @click
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      // k-text = 'test'
      const attrName = attr.name
      const exp = attr.value
      if(this.isDirective(attrName)) {
        // 指令 k-text k-model k-html
        const dir = attrName.substring(2) // text 
        this[dir] && this[dir](node,exp) // 也需要进行依赖收集
      } else if(this.isEventDirective(attrName)) {
        // 事件
        const dir = attrName.substr(1); // click
        this.eventHandler(node, exp, dir);
      }
    })
  }
  // 通用方法 update(node, 'xxx', 'text)
  update(node,exp ,dir) {
    // 构造更新函数 并执行首次赋值
    let updateFn = this[dir + 'Updater']
    updateFn && updateFn(node,this.$vm[exp])

    // 创建watcher,执行后续更新操作
    // 额外传递一个更新函数，能够更新指定dom元素
    new Watcher(this.$vm,exp,function(value){
      updateFn && updateFn(node,value)
    })
  }
  text(node,exp) {
    this.update(node,exp,'text')
  }
  html(node,exp) {
    this.update(node,exp,'html')
  }

  // 双向绑定
  model(node,exp) {
    this.update(node,exp,'model')
    let val = this.$vm[exp]
    // 双绑定还要处理视图对模型的更新
    // 针对的是input 
    node.addEventListener('input', e => {
      this.$vm[exp] = e.target.value
    })
  }
  textUpdater(node,value){
    node.textContent = value
  }
  
  htmlUpdater(node, value) {
    node.innerHTML = value;
  }
  modelUpdater(node, value) {
    node.value = value;
  }
  eventHandler(node, exp,dir) {
    // 去调用methods中的方法
    let vm = this.$vm
    let fn = vm.$options.methods && vm.$options.methods[exp]
    if(dir && fn) {
      node.addEventListener(dir,fn.bind(vm),false) // false 事件句柄在冒泡阶段执行
    }
  } 
}
