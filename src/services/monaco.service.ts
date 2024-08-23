import { Injectable, NgZone} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {editor, languages} from "monaco-editor";
import {CodeDeclareService} from "./code-declare.service";
import {IScriptOutLine} from "./code-editor.service";
import {MerkabaScript} from "../pages/code-editor/const/code-editor.page.const";
import {editorThemeConfig, language} from "../pages/code-editor/const/merkaba.editor.language";
@Injectable({
  providedIn: 'root'
})
export class MonacoService {
  monaco

  /**
   * 脚本内容的变化 todo 具体用来干什么的
   */
  public scriptChanged: Subject<{ action: string, content?: string, scriptId:any, line?: number }> = new Subject<any>();
  /**
   * 保存所有编辑器实例
   */
  public editorMap: Map<string, editor.IStandaloneCodeEditor > = new Map<string, editor.IStandaloneCodeEditor>();

  imgSrc: string | ArrayBuffer | null;
  // 代码提示的声明文件
  codeDeclareValue: string

  constructor(
    ngZone: NgZone,
    private service: CodeDeclareService
    ) {
    // 获取编写脚本的代码提示
    this.service.readDeclare().subscribe(res => {
      this.codeDeclareValue = res.content
    })
  }

  /**
   * 销毁指定id的编辑器实例
   * @param id
   */
  public async removeEditor(id:string) {
    let editor = this.editorMap.get(id)
    editor.dispose()
    console.log('editor被销毁了。。。。')
    // this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({});

    // let worker = await this.monaco.languages.typescript.getTypeScriptWorker()
    // 清除与模型相关的 TypeScript 标记
    const models = editor.getModel();
    if (models) {
      this.monaco.editor.setModelMarkers(models, 'typescript', []);
    }

    this.editorMap.delete(id);
  }

  /**
   * 获取创建的编辑器实例
   * @param id
   */
  public getEditorById(id: string):editor.IStandaloneCodeEditor {
    console.log(id)
    console.log(this.editorMap)
    return this.editorMap.get(id)
  }

  /**
   * 创建一个编辑器实例
   * @param script 脚本的内容
   * @param element  挂载的dom元素
   * @param content  脚本内容不存在的时候 可以指定内容
   */
  public createEditor(script: MerkabaScript, element: any, content?:string) {
    let media = window.matchMedia('(prefers-color-scheme: dark)')

    this.monaco = (window as any).monaco;
    this.initCustomerKey()
    this.setEditorColor(this.monaco.editor, media.matches)
    // 检测颜色切换主题
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', () => { this.setEditorColor( this.monaco.editor, media.matches ) });
    } else if (typeof media.addListener === 'function') {
      media.addListener(() => { this.setEditorColor( this.monaco.editor, media.matches ) });
    }
    const editor: editor.IStandaloneCodeEditor= this.monaco.editor.create(element, {
      model: this.monaco.editor.createModel(content || script.content, 'typescript',),
      value: script.content,
      wordWrap: 'on',
      automaticLayout: true,
      contextmenu: true,
      renderLineHighlight: false,
      autoClosingBrackets: 'beforeWhitespace',
      autoClosingQuotes: 'beforeWhitespace',
      smoothScrolling: true,
      readOnly: !script.editable,
      fontSize: 16,
      lineHeight: 30,
      foldingStrategy: "brace",
      suggestFontSize: 16,
      theme: media.matches ? 'myCustom-theme-dark' :'myCustom-theme',
      autoIndent: true,
      formatOnPaste: true,
      glyphMargin: true,
      minimap: {
        enabled: false,
      }
    });
    this.editorMap.set(script.id, editor);
    this.initEditorEvent(editor, script.id)
  }

  public async getCurrentScriptMenuById(id:string):Promise<IScriptOutLine> {
    const model = this.editorMap.get(id).getModel()
    // 获取语言工作线程
    const getTypeScriptWorker = await this.monaco.languages.typescript.getTypeScriptWorker()
    // todo 修改了 uri传入类型
    const work:languages.typescript.TypeScriptWorker = await getTypeScriptWorker(model.uri)
    return await work.getNavigationTree(model.uri.toString())
  }

  decorationId
  public revealLine(id: string, value) {
    const editor = this.editorMap.get(id)
    const startPosition = editor.getModel().getPositionAt(value.nameSpan.start);
    const endPosition = editor.getModel().getPositionAt(value.nameSpan.start + value.nameSpan.length);

    // 创建Monaco Range
    const range = new this.monaco.Range(
      startPosition.lineNumber, 0,
      endPosition.lineNumber, 100
    );
    console.log(value)
    console.log(range)
    // 聚焦到范围
    editor.revealRangeNearTopIfOutsideViewport(range);
    const model = editor.getModel()
    // 清除之前的装饰器
    // if (this.decorationId !== null) {
    //   model.deltaDecorations([decorationId], []);
    // }

    // 创建装饰器选项
    const options = {
      isWholeLine: false,
      className: 'focus-line', // 你可以在CSS中定义样式
      // backgroundColor: 'rgba(255, 255, 0, 0.5)' // 背景色为半透明黄色
    };

    this.decorationId = model.deltaDecorations(this.decorationId || [], [{ range, options }])
    const timer = setTimeout(() => {
      model.deltaDecorations(this.decorationId, []);
      clearTimeout(timer)
    }, 1000);
  }

  private initEditorEvent(editor: editor.IStandaloneCodeEditor, scriptId:string) {
    this.initAddCommand(editor)
    // 检测变化更新
    editor.onDidChangeModelContent((res: any) => {
      // script.changed = true;
      // script.content = editor.getValue();
      this.scriptChanged.next({ action: 'scriptChanged', scriptId, content: editor.getValue() })
    });
    editor.onDidFocusEditorText(() => {
      this.initAddCommand(editor)
    });
    editor.addAction({
      id: 'merkabaScriptRun',
      label: 'Run Script',
      contextMenuGroupId: 'navigation',
      run: ()=> {
        this.scriptChanged.next({ action: 'scriptRun', scriptId })
      }
    });
    editor.addAction({
      id: 'merkabaScriptSave',
      label: 'Save Script',
      contextMenuGroupId: 'navigation',
      run: ()=> {
        this.scriptChanged.next({ action: 'scriptSave', scriptId })
      }
    });
    editor.onMouseDown(  async(e) => {
      if(!e.event.ctrlKey && !e.event.metaKey) return
      console.log(e)
      const model = editor.getModel()
      let value = model.getWordAtPosition(e.target.position).word
      console.log(e.target.range)
      // editor.getModel().findMatches(value, new Range(e))
      // editor.getModel().getLineDecorations()
      console.log(value)
    })
    // 监听粘贴事件
    // editor.onDidPaste((e) => {
    //   let timer = setTimeout(() => {
    //     console.log(e)
    //     console.log(this.imgSrc)
    //     if(!this.imgSrc) return
    //     script.imgSrc = this.imgSrc
    //     this.setImgStyle(editor, e.range)
    //     clearTimeout(timer)
    //   }, 300)
    // })
    // this.initBreakPoints(script)
  }

  private initAddCommand(editor) {
    //  快捷键
    editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyD, (e) => {
      editor.trigger('', 'editor.action.deleteLines', {});
    });
    editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyL, () => {
      console.log('?')
      console.log(editor)
      editor.trigger('', 'editor.action.gotoLine',{});
    });
    editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyO, () => {
      editor.getAction('editor.action.quickOutline').run();
    });
  }

  private initBreakPoints(script: MerkabaScript) {
    script.breakPoints = []
    let editor = this.editorMap.get(script.id)
    let decorations = editor.deltaDecorations([], script.breakPoints);
    editor.onMouseDown((e) => {
      if (e.target.element.classList.contains('line-numbers')) {
        let codeLine = e.target.position.lineNumber
        let index = script.breakPoints.findIndex(item => item.line == codeLine)
        if (index != -1) {
          script.breakPoints.splice(index, 1)
          // this.scriptChanged.next({"script": script, "action": "removeBreakPoint", "line": codeLine});
        } else {
          script.breakPoints.push({
            range: new this.monaco.Range(codeLine, 1, codeLine, 1),
            options: {
              isWholeLine: true,
              className: 'debug-line',
              glyphMarginClassName: 'debug'
            },
            line: codeLine
          })
          // this.scriptChanged.next({"script": script, "action": "addBreakPoint", "line": codeLine});
        }
        decorations = editor.deltaDecorations(decorations, script.breakPoints);
      }
    });
  }

  // change 0 跳过 1 下一步 -1 上一步
  private changeLine(script: MerkabaScript, change: number): number {
    let editor = this.editorMap.get(script.id)
    // 给定一个范围 官方要求这样写
    let range = new this.monaco.Range(1, 1000, 1, 1000);
    let lines = editor.getDecorationsInRange(range)
    // 获取当前行的信息 有一个当前行就取他显示的位置 没有就取第一个debug的位置
    let currentLines = lines.filter(item => item.options.className == 'debug-current-line')
    let current = currentLines[0] || lines.filter(item => item.options.className == 'debug-line')[0];
    if (!current) return 0
    this.setLineBreakPointStyle(script, current.range.endLineNumber, change)
    return current.range.endLineNumber;
  }

  // 当前行的位置 | 加减
  private setLineBreakPointStyle = (script, current, change) => {
    // 找到当前行的元素并删除
    let index = script.breakPoints.findIndex(item => item.line == current && item.options.className == 'debug-current-line')
    if (index != -1) script.breakPoints.splice(index, 1);
    let line: number = 0;
    if (change == 0) { // 跳过
      let debugLines = script.breakPoints.filter(item => item.options.className == 'debug-line')
      console.log(current, debugLines);
      line = this.findRecentLine(current, debugLines)
      console.log(line);
    } else line = current + change
    line && script.breakPoints.push({
      range: new this.monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'debug-current-line',
      },
      line,
    })
    let decorations = script.monacoEditor.deltaDecorations([], script.breakPoints);
    script.monacoEditor.deltaDecorations(decorations, script.breakPoints)
  }

  private findRecentLine(current, debugLines) {
    return debugLines[debugLines.findIndex(item => current < item.line)].line
  }

  private initCustomerKey() {
    this.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false, // 不启用语义验证
        noSyntaxValidation: false,   // 不启用语法验证
        noSuggestionDiagnostics: false,  // 不显示建议性诊断信息
        diagnosticCodesToIgnore: [2580,2393,2451],//   忽略固定的错误码
        onlyVisible: true,  // 只对当前可见区域内的代码进行诊断检查
    })
    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        // 编译的ES版本
        target: this.monaco.languages.typescript.ScriptTarget.ES2020,
        // 允许在ts中引用非ts文件
        allowNonTsExtensions: true,
        // 指定使用的模块
        moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: this.monaco.languages.typescript.ModuleKind.CommonJS,
        // 是否生成输出文件
        noEmit: false,
    });
    this.monaco.languages.typescript.typescriptDefaults.addExtraLib(this.codeDeclareValue, 'merkaba.d.ts');

    // this.monaco.languages.register({
    //   id: 'merkabaLanguage',
    //   aliases: ['MyCustomLanguage', 'mycustomlanguage'],
    // })

    this.monaco.languages.setMonarchTokensProvider('typescript', {
      ...this.monaco.languages.typescript.typescriptDefaults,
      ...language
    })

    this.monaco.editor.defineTheme('myCustom-theme-dark', {
      base: 'vs-dark', // 选择一个基础主题
      ...editorThemeConfig
    });

    this.monaco.editor.defineTheme('myCustom-theme', {
		  base: 'vs', // 选择一个基础主题
		  ...editorThemeConfig
	  });
  }

  private setEditorColor(editor, darkMode) {
    // editor.setTheme(darkMode ? 'vs-dark' : 'vs')
    this.monaco.editor.setTheme(darkMode ? 'myCustom-theme-dark' :'myCustom-theme')
  }

  private async getParseImgSrc(e) {
    let files = e.clipboardData.files
    // 找到图片文件file
    console.log(files)
    if(!files || files.length < 0 || !(files[0]?.type === "image/png")) {
      console.log("不是图片");
      this.imgSrc = ''
      return
    }

    let fr = new FileReader();
    // 读取 file 然后返回 data:URL 格式的字符串（base64 编码）以表示所读取文件的内容。
    fr.readAsDataURL(files[0]);
    fr.onload = (e) => {
      this.imgSrc = e.target.result
    }
  }

  private setImgStyle(editor, range) {
    console.log(range)
    editor.createDecorationsCollection([
      {
        range,
        options: { inlineClassName: "code-span" },
      },
    ]);
  }

  /**
   * todo 添加小部件
   * @param script
   */
  private insetImg(script: MerkabaScript) {
    // var contentWidget = {
    //   domNode: null,
    //   getId: function() {
    //     return 'my.content.widget';
    //   },
    //   getDomNode: () => {
    //     if (!contentWidget.domNode) {
    //       contentWidget.domNode = document.createElement('div');
    //       contentWidget.domNode.innerHTML = `
    //         <img width="20px" height="20px" src="/src/assets/head.png" />
    //       `;
    //     }
    //     return contentWidget.domNode;
    //   },
    //   getPosition: () => {
    //     return {
    //       position: {
    //         lineNumber: 6,
    //         column: 1
    //       },
    //       preference: [this.monaco.editor.ContentWidgetPositionPreference.ABOVE,
    //         this.monaco.editor.ContentWidgetPositionPreference.BELOW]
    //     };
    //   }
    // };
    // script.monacoEditor.addContentWidget(contentWidget);
  }

}
