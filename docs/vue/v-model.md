### 谈谈v-model

模板编译
模板编译的主要目的是将模板template转换成渲染函数render

模板编译的必要性
Vue2.0 需要用到VNode描述视图以及各种交互，手写显然不切实际，因此用户只需编写类似HTML代码 的Vue模板，通过编译器将模板转换为可返回VNode的render函数。

整体流程
compileToFunctions 若指定template或el选项，则会执行编译，platforms\web\entry-runtime-with-compiler.js

65行

const { render, staticRenderFns } = compileToFunctions(template, {
编译过程
src\compiler\index.js

createCompilerCreator

整个编译过程执行三个方法

* parse() 解析模板template，转化成抽象语法树ATS(Abstract Syntax Tree)
* optimize() 优化————标记静态节点和静态根节点
* generate() 代码生成
```js
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 解析模板template
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options) //优化——标记静态节点和静态根节点
  }
  // 代码生成
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```
#### 第一步：parse()
处理模板属性 src\compiler\parser\index.js； 757行 processAttrs(el)

进入processAttrs() 函数 **if (dirRE.test(name)) { ** // 1.针对指令的属性处理

if (bindRE.test(name)) { // v-bind

else if (onRE.test(name)) { // v-on

else { // normal directives

进入处理普通指令

普通指令会在ATS树上添加directives属性 addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i])

具体看 addDirective 函数

// 添加directives属性

```js
function addDirective (el,name,rawName,value,arg,isDynamicArg,modifiers,range) {
    (el.directives || (el.directives = [])).push(rangeSetItem({
      name: name,
      rawName: rawName,
      value: value,
      arg: arg,
      isDynamicArg: isDynamicArg,
      modifiers: modifiers
    }, range));
    el.plain = false;
  }
```


最终ATS树对了一个属性对象 directives

directives: [
    {
      rawName: 'v-model',
      value: 'value',
      name: 'v-model',
      modifiers: undefined
    }
  ]
#### 第二步：优化 optimize()
#### 第三步：代码生成 generate()
src\compiler\codegen\index.js

48行 const code = ast ? genElement(ast, state) : '_c("div")'

然后会进入79行 对模板的属性处理，最终会返回拼接好的字符串模板

```js
if (!el.plain || (el.pre && state.maybeComponent(el))) {
    data = genData(el, state) 
}

```

然后对指令的处理会进入 genDirectives 流程，生成render字符串

```js
  function genDirectives (el: ASTElement, state: CodegenState): string | void {
    const dirs = el.directives
    if (!dirs) return
    let res = 'directives:['
    let hasRuntime = false
    let i, l, dir, needRuntime
    for (i = 0, l = dirs.length; i < l; i++) {
      dir = dirs[i]
      needRuntime = true
      const gen: DirectiveFunction = state.directives[dir.name]
      if (gen) {
        // compile-time directive that manipulates AST.
        // returns true if it also needs a runtime counterpart.
        needRuntime = !!gen(el, dir, state.warn)
      }
      if (needRuntime) {
        hasRuntime = true
        res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
          dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
        }${
          dir.arg ? `,arg:${dir.isDynamicArg ? dir.arg : `"${dir.arg}"`}` : ''
        }${
          dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
        }},`
      }
    }
    if (hasRuntime) {
      return res.slice(0, -1) + ']'
    }
  }
```

genDirectives 拿到ATS树种的 directives 对象，并遍历解析指令对象，最终以 'directives:[' 包裹的字符串返回

进入 const gen: DirectiveFunction = state.directives[dir.name]

其中 state.directives[dir.name] --> model，是 src\platforms\web\compiler\directives\model.js 中的 model 函数

47行的判断，进入genDefaultModel()

```js
  else if (tag === 'input' || tag === 'textarea'){
    genDefaultModel(el, value, modifiers)
}
function genDefaultModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
): ?boolean {
  const type = el.attrsMap.type

  // warn if v-bind:value conflicts with v-model
  // except for inputs with v-bind:type
  if (process.env.NODE_ENV !== 'production') {
    const value = el.attrsMap['v-bind:value'] || el.attrsMap[':value']
    const typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type']
    if (value && !typeBinding) {
      const binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value'
      warn(
        `${binding}="${value}" conflicts with v-model on the same element ` +
        'because the latter already expands to a value binding internally',
        el.rawAttrsMap[binding]
      )
    }
  }

  // 修饰符
  const { lazy, number, trim } = modifiers || {}
  const needCompositionGuard = !lazy && type !== 'range'
  // lazy修饰符将触发同步的事件从input改为change
  const event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input'

  let valueExpression = '$event.target.value'
  // 过滤用户输入的首尾空白符
  if (trim) {
    valueExpression = `$event.target.value.trim()`
  }
  // 将用户输入转为数值类型
  if (number) {
    valueExpression = `_n(${valueExpression})`
  }

  let code = genAssignmentCode(value, valueExpression)
  if (needCompositionGuard) {
  //  保证了不会在输入法组合文字过程中得到更新
    code = `if($event.target.composing)return;${code}`
  }

  //  添加value属性
  addProp(el, 'value', `(${value})`)
  // 绑定事件
  addHandler(el, event, code, null, true)
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()')
  }
}
```


添加value属性
**addProp() ** 函数执行或，ATS树上添加了 props 属性

props:[
 {
   dynamic: undefined
   name: "value"
   value: "(test)"
 }
]
绑定事件 addHandler()
const newHandler: any = rangeSetItem({ value: value.trim(), dynamic }, range)
// newHandler是一个对象
{
    dynamic: undefined,
    value: "if($event.target.composing)return;test=$event.target.value"
}
执行到 146行， events[name] = newHandler，为ATS添加事件event

event: {
    input: {value: "if($event.target.composing)return;test=$event.target.value", dynamic: undefined}
}
genDefaultModel() 执行完后，AST树上就新增了两个属性

props
event
最后在 src\platforms\web\entry-runtime-with-compiler.js 中72行生成的 options.render = render 的 render 为

```js
  (function anonymous(
) {
    with(this){
        return 
         _c('div',{attrs:{"id":"app"}},[(test)?_c('h1',[_v(_s(test))]):_e(),_v(" "),
         _c(
            'input',
            {
                directives:[{name:"model",rawName:"v-model",value:(test),expression:"test"}],
                domProps:{"value":(test)},
                on:{"input":function($event){if($event.target.composing)return;test=$event.target.value}}})])}
})
```

为什么说v-model是一个语法糖，从render函数的最终结果可以看出，最终以两部分的形式存在于input标签中：

将value 以props的形式存在domProps中
以事件的形式存储input事件，存在on中
所以

<input v-model='test'>
//等同于
<input type="text" :value="test" @input="(e) => { this.test = e.target.value }