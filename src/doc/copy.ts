import { Injectable, NgZone} from '@angular/core';
import {async, firstValueFrom, map, Subject} from 'rxjs';
import {editor, languages, Position} from "monaco-editor";
import {CodeDeclareService} from "./code-declare.service";
import {CodeEditorService, IScriptOutLine} from "./code-editor.service";
import {MerkabaRecord, MerkabaScript} from "../pages/code-editor/const/code-editor.page.const";
import {editorThemeConfig, language} from "../pages/code-editor/const/merkaba.editor.language";
import * as monaco from 'monaco-editor';
@Injectable({
  providedIn: 'root'
})
export class MonacoService {
  monaco = monaco;
  /**
   * 脚本内容的变化 todo 具体用来干什么的
   */
  public scriptChanged: Subject<{ action: string, content?: string, scriptId:any, line?: number }> = new Subject<any>();
  /**
   * 保存所有编辑器实例
   */
  public editorMap: Map<string, editor.IStandaloneCodeEditor > = new Map<string, editor.IStandaloneCodeEditor>();
  // 保存所有的脚本文件 uri -》 merkabascript
  public editorScript: Map<string, MerkabaScript> = new Map<string, MerkabaScript>();

  // 当个应用的文件模型
  public models = {};
  // 代码提示的声明文件
  codeDeclareValue: string

  // 当前正在使用的实例  切换tab 要同步，创建tab同步
  currentEditor: monaco.editor.IStandaloneCodeEditor;

  constructor(
    private service: CodeDeclareService,
    private codeEditorService: CodeEditorService
  ) {
    // 获取编写脚本的代码提示
    this.service.readDeclare().subscribe(res => {
      console.log(res);
      this.codeDeclareValue = res.content
    })


    this.codeEditorService.scriptChannel.subscribe(res => {
      switch (res.type){
        case 'switchScript':
          this.currentEditor = this.editorMap.get(res.script.id);
          // 切换当前编辑器实例有问题
          console.log(this.currentEditor)
      }
    })
  }

  /**
   * 初始化编辑器模块化
   * @param scriptList 所有record记录
   */
  async initModels(scriptList: MerkabaRecord[]): Promise<void> {
    // if (!scriptList || scriptList.length === 0) {
    //   // scriptList 为 undefined, null 或空数组时，直接返回
    //   return;
    // }
    //
    // const modelPromises = scriptList.map(async (item) => {
    //   if (item.type === 1 || item.type === 0) {
    //     await this.initModels(item.children);  // 递归处理子项
    //   } else if (item.type === 2) {
    //     const url = 'file:///' + item.uri + '.ts';
    //     const content: MerkabaScript = await firstValueFrom(this.codeEditorService.readScript(item.id));
    //     this.models[url] = this.monaco.editor.createModel(content.content, 'typescript', monaco.Uri.parse(url));
    //   }
    // });
    // await Promise.all(modelPromises);
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
   * 创建一个编辑器实例
   * @param script 脚本的内容
   * @param element  挂载的dom元素
   */
  public createEditor(script: MerkabaScript, element: any) {
    const uri = 'file:///' + script.uri + '.ts';
    const model = this.models[uri];
    if (!model) {
      console.error('Model not found for:', script.uri);
      return;
    }
    let media = window.matchMedia('(prefers-color-scheme: dark)')
    this.initCustomerKey()
    this.setEditorColor(this.monaco.editor, media.matches)
    // 检测颜色切换主题
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', () => { this.setEditorColor( this.monaco.editor, media.matches ) });
    } else if (typeof media.addListener === 'function') {
      media.addListener(() => { this.setEditorColor( this.monaco.editor, media.matches ) });
    }
    const editor: editor.IStandaloneCodeEditor= monaco.editor.create(element, {
      model: model,
      value: script.content,
      language: 'typescript',
      wordWrap: 'on',
      automaticLayout: true,
      contextmenu: true,
      autoClosingBrackets: 'beforeWhitespace',
      autoClosingQuotes: 'beforeWhitespace',
      smoothScrolling: true,
      readOnly: !script.editable,
      fontSize: 16,
      lineHeight: 30,
      suggestFontSize: 16,
      theme: media.matches ? 'myCustom-theme-dark' :'myCustom-theme',
      formatOnPaste: true,
      glyphMargin: true,
      minimap: {
        enabled: false,
      }
    });
    this.editorMap.set(script.id, editor);
    this.initEditorEvent(editor, script.id)
    this.currentEditor = editor;
    this.editorScript.set(uri, script);

  }

  public async getCurrentScriptMenuById(uri: string, id: string): Promise<IScriptOutLine> {
    const model = this.models['file:///' + uri + '.ts'];

    if (!model) {
      throw new Error('Model not found!');
    }


    const getTypeScriptWorker = await monaco.languages.typescript.getTypeScriptWorker();
    const worker = await getTypeScriptWorker(model.uri);

    return await worker.getNavigationTree(model.uri.toString());
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
      const position = e.target.position;
      const model = editor.getModel();
      // 跳转到对应的位置
      if (model && position) {
        this.goToDefinition(editor, model, position);
      }
    })
  }

  async getDefinitionAtPosition(model: monaco.editor.ITextModel, position: monaco.Position): Promise<monaco.languages.Location[]> {
    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    const tsWorker = await worker(model.uri);
    const offset = model.getOffsetAt(position);
    const fileName = model.uri.toString();

    try {
      // todo 空的返回
      const definitions = await tsWorker.getDefinitionAtPosition(fileName, offset);

      // Handle cases where definitions might be null or undefined
      if (!definitions) {
        console.error('No definitions found.');
        return [];
      }

      return definitions.map(definition => {
        if (!definition || !definition.range) {
          console.error('Definition or definition range is missing.');
          return null;
        }

        return {
          uri: monaco.Uri.parse(definition.uri),
          range: new monaco.Range(
            definition.range.startLineNumber,
            definition.range.startColumn,
            definition.range.endLineNumber,
            definition.range.endColumn
          )
        };
      }).filter(def => def !== null); // Filter out any null values
    } catch (err) {
      console.error('Error getting definition:', err);
      return [];
    }
  }

  goToDefinition(editor: monaco.editor.IEditor, model: monaco.editor.ITextModel, position: monaco.Position) {
    this.getDefinitionAtPosition(model, position).then(definitions => {
      console.log(definitions);
      if (definitions.length > 0) {
        const firstDefinition = definitions[0];
        const definitionModel = monaco.editor.getModel(firstDefinition.uri);

        // 需要存储uri和script
        const uri = firstDefinition.uri.toString();
        // 执行他的初始化行为   光标定位到指定为止， 如果没有则到0 0
        this.codeEditorService.scriptChannel.next({type: 'currentScript', uri: uri, script: this.editorScript.get(uri)});
        if (definitionModel) {
          editor.setModel(definitionModel);
          editor.setPosition(new Position(firstDefinition.range.startLineNumber, firstDefinition.range.startColumn));
          editor.revealRangeInCenterIfOutsideViewport(firstDefinition.range);
        } else {
          console.log('Definition model not found.');
        }
      } else {
        console.log('No definitions found.');
      }
    }).catch(err => {
      console.error('Error getting definition:', err);
    });
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
      noSemanticValidation: true, // 不启用语义验证
      noSyntaxValidation: false,   // 不启用语法验证
      noSuggestionDiagnostics: false,  // 不显示建议性诊断信息
      diagnosticCodesToIgnore: [2580,2393,2451],//   忽略固定的错误码
      onlyVisible: true,  // 只对当前可见区域内的代码进行诊断检查
    })

    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      target: this.monaco.languages.typescript.ScriptTarget.ES2020,
      allowSyntheticDefaultImports: true,
      allowNonTsExtensions: true,
      allowJs: true,
      // checkJs: true,
      // noEmit: true,
    });

    this.monaco.languages.typescript.typescriptDefaults.addExtraLib(this.codeDeclareValue, 'merkaba.d.ts');


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
}
