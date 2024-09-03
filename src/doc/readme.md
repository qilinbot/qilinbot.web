

#### 断点调试
1. 断点的维护
   1）在代码编辑器中实现断点标记以及在运行过程中执行行的高亮显示
   2）点击行号添加删除断点
2. 断点的管理和同步
  1）对于当前断点的存储
  2）断点的同步，在调试过程中可以修改断点信息并更新同步到服务器
3. 断点调试的交互
   提供一个调试控制面板或工具栏，包含以下操作按钮：
   启动调试：调用 startDebugging API，开始调试会话。
   单步执行：调用 stepOver 或 stepOne API，逐步执行代码。
   暂停/继续：支持暂停和继续调试（通常可以复用单步执行按钮）。
   停止调试：调用 stopDebugging API，停止当前调试会话。
   重启调试：调用 restartDebugging API，重新启动调试会话。
4. 调试信息区（DebugVariableMonitor） websocket fetch
   在 DebugVariableMonitor 中显示当前调试状态下的变量和值。
   // 支持用户添加表达式监视，实时显示表达式的计算结果。
   在每一步调试操作后，自动更新监视区中的内容。


辅助的Service
- DebugWebSocketService：获取传输断点调试信息
- DebugInfoService：同步组件的信息

需要的API
- startDebugging
- stepOver 
- stepOne 
- stopDebugging
- restartDebugging

```ts
// 在调试之前先确定要监视的变量和要提供的断点信息
export interface DebugInfo {
  variableInfos: Variable[];       // 当前的变量信息
  outputInfos: Output[];           // 调试输出信息
  isOver: boolean;                 // 调试是否完成
  currentFunction: string;         // 当前执行的函数名
  
  previousLine: number;            // 上一行执行的行号
  errorInfo: string | null;        // 错误信息（如果有）
}
```

  
### 代码提示  

支持这种： 
![img_2.png](img_2.png)
解决上述函数形参中的代码提示
1. 通过jsdoc注释获取函数的参数类型
```ts
// 提供额外的全局类型声明或定义类型
monaco.languages.typescript.javascriptDefaults.addExtraLib(`
/**
 * @typedef {Object} Person
 * @property {number} a
 * @property {number} b
 * @property {function(string): void} sayHi
 */
 class Person{
  a: number;
  b: number;
  sayHi(name: string){
    console.log(name)
  }
 }
`, 'filename/fake.d.ts');

// 然后在你写代码过程中 添加类型的参数配置
/**
 * @param {Person} a
 */
function hello(a){
  a
}
```
2. 采用TypeScript的类型声明
```ts
function hello(a: Person){
    a.sayHi
}
```

代码提示来源于
1. 当前代码文件中出现的关键字 abc 可以推断出来
2. 自定义声明文件.d.ts 在代码中引入

### 大纲
页面大纲根据如下结构渲染即可 （函数体内部操作了什么事件）
需要知道函数内部用到了什么其他函数的模块 在一个作用域下列出有什么， 一个函数需要具体列出使用了其他的什么模块

```json

{
    "text": "<global>",
    "kind": "script",
    "kindModifiers": "",
    "spans": [
        {
            "start": 0,
            "length": 342
        }
    ],
    "childItems": [
        {
            "text": "Animal",
            "kind": "class",
            "kindModifiers": "",
            "spans": [
                {
                    "start": 139,
                    "length": 170
                }
            ],
            "nameSpan": {
                "start": 145,
                "length": 6
            },
            "childItems": [
                {
                    "text": "a",
                    "kind": "property",
                    "kindModifiers": "",
                    "spans": [
                        {
                            "start": 155,
                            "length": 16
                        }
                    ],
                    "nameSpan": {
                        "start": 155,
                        "length": 1
                    }
                },
                {
                    "text": "add",
                    "kind": "method",
                    "kindModifiers": "",
                    "spans": [
                        {
                            "start": 192,
                            "length": 48
                        }
                    ],
                    "nameSpan": {
                        "start": 192,
                        "length": 3
                    }
                },
                {
                    "text": "b",
                    "kind": "property",
                    "kindModifiers": "",
                    "spans": [
                        {
                            "start": 174,
                            "length": 14
                        }
                    ],
                    "nameSpan": {
                        "start": 174,
                        "length": 1
                    }
                },
                {
                    "text": "copy",
                    "kind": "method",
                    "kindModifiers": "",
                    "spans": [
                        {
                            "start": 244,
                            "length": 63
                        }
                    ],
                    "nameSpan": {
                        "start": 244,
                        "length": 4
                    }
                }
            ]
        },
        {
            "text": "dog",
            "kind": "const",
            "kindModifiers": "",
            "spans": [
                {
                    "start": 317,
                    "length": 18
                }
            ],
            "nameSpan": {
                "start": 317,
                "length": 3
            }
        },
        {
            "text": "getAge",
            "kind": "function",
            "kindModifiers": "",
            "spans": [
                {
                    "start": 103,
                    "length": 34
                }
            ],
            "nameSpan": {
                "start": 94,
                "length": 6
            }
        },
        {
            "text": "Person",
            "kind": "function",
            "kindModifiers": "",
            "spans": [
                {
                    "start": 15,
                    "length": 61
                }
            ],
            "nameSpan": {
                "start": 24,
                "length": 6
            }
        }
    ]
}
```
```ts
// 正则匹配
// 需要动态维护事件的
export function generateOutline(code: string): OutlineEntry[] {
  const outlines: OutlineEntry[] = [];
  const regex = /(webClient\.load\(.*?\))|(utilModule\.click_Menu\(.*?\))|(bindSpecCodeMoudle\.bindSpecCode\(.*?\))/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    outlines.push({
      name: match[0],
      kind: monaco.languages.CompletionItemKind.Function,
      range: {
        startLineNumber: code.substr(0, match.index).split('\n').length,
        startColumn: match.index - code.lastIndexOf('\n', match.index),
        endLineNumber: code.substr(0, match.index + match[0].length).split('\n').length,
        endColumn: match.index + match[0].length - code.lastIndexOf('\n', match.index + match[0].length),
      },
    });
  }

  return outlines;
}

```

### 代码跳转

实现方案：
monaco本身是支持模块化的 声明在模块化中文件是自动能够跳转的，如果跨文件先拦截他的跳转信息，我新建一个tab创建monaco实例之后，利用拦截的跳转信息，光标视图可以定位到跳转该内容的位置。

保证monaco的新建实例共享同一组文件module， 在monaco-service 中维护一个文件module的映射关系，在新建monaco实例的时候，把文件module映射关系注入到monaco实例中，这样就可以保证跨文件跳转的时候，能够找到对应的文件module 支持增删文件对应删除module中的文件


增加一套模块化的管理（monaco-service）
1. 在monaco初始化，加载所有的脚本文件 并创建对应的模块配置（之后所有的实例创建都通过于此展开）
2. 增删文件的时候，更新模块配置 
3.  注册跳转功能 重新实现跳转逻辑 处理点击事件 跳转目标在另一个文件中，你需要打开目标文件并创建相应的 Monaco Editor 实例

```ts

models = {}

import {MerkabaScript} from "./code-editor.page.const";
import {model} from "@angular/core";

models = {}

// 创建一个新的tab的时候 创建的是在模块化当中model 这样可以实现共享语言服务和类型检查
function openScriptEditor(filePath: string, data: MerkabaScript) {
  const uri = monaco.Uri.parse(`file:///${filePath}`);
  const model = monaco.editor.createModel(data.content, data.language, uri);
  models[uri.toString()] = model;
  this.monacoService.createEditor(script, element, model)
  // 添加tab信息
}

function closeScriptEditor(filePath: string) {
  const uri = monaco.Uri.parse(`file:///${filePath}`);
  const model = models[uri.toString()];
  if (model) {
    model.dispose();
    delete models[uri.toString()];
  }
}

```

基本的思路
```ts

// 打开文件并创建 Tab
function openFileInTab(filePath, fileContent) {
  const uri = monaco.Uri.parse(`file:///${filePath}`);
  
  // 检查模型是否已存在
  if (!models[uri.toString()]) {
    const model = monaco.editor.createModel(fileContent, 'javascript', uri);
    models[uri.toString()] = model;
  }

  // 创建新的 Tab，关联到文件模型
  const tab = {
    id: `tab-${tabs.length + 1}`,
    title: filePath.split('/').pop(),
    model: models[uri.toString()],
    editor: null // Monaco 编辑器实例将稍后创建
  };

  tabs.push(tab);
  createEditorForTab(tab);
  setActiveTab(tab.id);
}

```

```ts
// 创建多个文件模型
const models = {
  'file:///main.js': monaco.editor.createModel(`
    import { sayHello } from './hello.js';
    sayHello();
  `, 'javascript', monaco.Uri.parse('file:///main.js')),

  'file:///hello.js': monaco.editor.createModel(`
    export function sayHello() {
      console.log('Hello World');
    }
  `, 'javascript', monaco.Uri.parse('file:///hello.js'))
};

// 创建 Monaco 编辑器实例，使用其中一个模型
const editor = monaco.editor.create(document.getElementById('container'), {
  model: models['file:///main.js'],
  language: 'javascript',
  theme: 'vs-dark',
  automaticLayout: true
});

## 配置 TypeScript 和 JavaScript 语言服务
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  allowJs: true,
  checkJs: true
});

monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

// 监听鼠标的点击事件 动态的加载数据

editor.onMouseDown((event) => {
  const position = event.target.position;

  if (position) {
    editor.getAction('editor.action.goToDeclaration').run().then(() => {
      const model = editor.getModel();
      const uri = model.uri.toString();

      // 如果跳转到的模型不在当前视图中，切换到该模型
      if (models[uri] && model !== models[uri]) {
        // 新建tab 创建monaco实例 加载对应url的内容
        
        // editor.setModel(models[uri]);
      }
    });
  }
});
```

### 图片
page.click(图片)
> 目前已经实现在代码编辑器中实现插入图片，hover到图片上会显示图片的完整图片
> 

选中的图片切片哪里来？流程图片代码的编写流程是什么？

