import { Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Subject} from 'rxjs';
import {editor} from "monaco-editor";
import {CodeDeclareService} from "./code-declare.service";
import {CodeEditorService} from "./code-editor.service";
import {MerkabaRecord, MerkabaScript} from "../pages/code-editor/const/code-editor.page.const";
import * as monaco from 'monaco-editor';
import ITextModel = editor.ITextModel;
import {editorThemeConfig} from "../pages/code-editor/const/editor.language";
@Injectable({
  providedIn: 'root'
})
export class MonacoService {
  monaco = monaco;

  scriptInitLoaded = new BehaviorSubject<boolean>(false);
  /**
   * 脚本内容的变化 todo 具体用来干什么的
   */
  public scriptChanged: Subject<{ action: string, content?: string, scriptId:any, line?: number }> = new Subject<any>();
  /**
   * 保存所有编辑器实例
   */
  public editorMap: Map<string, editor.IStandaloneCodeEditor > = new Map<string, editor.IStandaloneCodeEditor>();
  // 保存所有的脚本文件 uri -> merkabascript
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
    this.codeDeclareValue = res.content;
  })
    this.codeEditorService.scriptChannel.subscribe(res => {
      switch (res.type){
        case 'switchScript':
          // this.currentEditor = this.editorMap.get(res.script.id);
          // 切换当前编辑器实例有问题
          // console.log(this.currentEditor)
      }
    })
  }

  /**
   * 初始化编辑器模块化
   * @param scriptList 所有record记录
   */
  async initModels(scriptList: MerkabaRecord[]): Promise<void> {
    if (!scriptList || scriptList.length === 0) {
      // scriptList 为 undefined, null 或空数组时，直接返回
      return;
    }

    const modelPromises = scriptList.map(async (item) => {
      if (item.type === 1 || item.type === 0) {
        await this.initModels(item.children);  // 递归处理子项
      } else if (item.type === 2) {
        const url = 'file:///' + item.uri + '.js';
        const content: MerkabaScript = await firstValueFrom(this.codeEditorService.readScript(item.id));
        this.models[url] = this.monaco.editor.createModel(content.content, 'javascript', monaco.Uri.parse(url));
        console.log(content);
        this.editorScript.set(url, content); // 存储所有的脚本
      }
    });
    await Promise.all(modelPromises);
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
   * @param start
   */
  public createEditor(script: MerkabaScript, element: any, start?: number) {
    const uri = 'file:///' + script.uri + '.js';
    const model = this.models[uri];
    if (!model) {
      console.error('Model not found for:', script.uri);
      return;
    }
    this.initCustomerKey()
    const editor: editor.IStandaloneCodeEditor= monaco.editor.create(element, {
      model: model,
      value: script.content,
      language: 'javascript',
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
      theme: 'myCustom-theme-dark',
      // theme: media.matches ? 'myCustom-theme-dark' :'myCustom-theme',
      formatOnPaste: true,
      glyphMargin: true,
      minimap: {
        enabled: false,
      }
    });
    this.editorMap.set(uri, editor);
    this.initEditorEvent(editor, script.id);
    this.currentEditor = editor;
    if(start){
      this.setCursor(uri, start);
    }
  }

  // 唯一的ID
  initEditorEvent(editor: editor.IStandaloneCodeEditor, scriptId){
    // 监听编辑器内容的变化 修改当前的changed状态 大纲的时候可以加个防抖 避免多次触发高运算的函数
    editor.onDidChangeModelContent(res => {
      this.scriptChanged.next({action: 'scriptChanged', scriptId, content: editor.getValue()})

      // todo 监听并获取大纲的内容
      // this.getOutline(this.models)；
    })

    editor.onMouseDown(res => {
      if((res.event.ctrlKey || res.event.metaKey) && res.target.element.className.includes('mtk')){
        const position = res.target.position;  // 获取我当前点击的位置
        if(position){
          const model: ITextModel = editor.getModel();
          const word = model.getWordAtPosition(position);
          if(word){
            monaco.languages.typescript.getJavaScriptWorker().then(worker => {
              worker(model.uri).then(client => {
                const offset = model.getOffsetAt(position);
                client.getDefinitionAtPosition(model.uri.toString(), offset).then(result => {
                  console.log(result[0].containerName, result[0].fileName, result);
                  let uri = result[0].fileName;
                  let start = result[0].textSpan.start;
                  console.log(this.editorScript.get(uri))
                  this.codeEditorService.scriptChannel.next({type: 'switchTab', uri, script: this.editorScript.get(uri), start})
                })
              })
            })
          }
        }
      }
    })
  }

  private initCustomerKey() {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      // allowJs: true,
      // allowSyntheticDefaultImports: true,
      // allowNonTsExtensions: true,
    });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(this.codeDeclareValue, 'filename/merkaba.d.ts');

    // 注册主题色
    this.monaco.editor.defineTheme('myCustom-theme-dark', {
      base: 'vs-dark', // 选择一个基础主题
      ...editorThemeConfig
    });
  }

  getOutline(model: monaco.editor.ITextModel) {
    monaco.languages.typescript.getTypeScriptWorker().then(worker => {
      worker(model.uri).then((client: any) => {
        client.getNavigationTree(model.uri.toString()).then((tree: any) => {
          console.log(tree);  // 打印出当前文件的代码结构树
        });
      });
    }).catch(error => {
      console.error('Error getting TypeScript worker:', error);
    });
  }


  setCursor(uri, start){
    console.log(this.models[uri])
    const model = this.models[uri];
    if(model){
      const position = model.getPositionAt(start);
      console.log(position)
      this.editorMap.get(uri).setPosition(position);
      this.editorMap.get(uri).revealPositionInCenter(position);
      console.log('切换定位成功！')
    }
  }
}
