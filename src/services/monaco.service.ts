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
   */
  public createEditor(script: MerkabaScript, element: any) {
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
      // theme: media.matches ? 'myCustom-theme-dark' :'myCustom-theme',
      formatOnPaste: true,
      glyphMargin: true,
      minimap: {
        enabled: false,
      }
    });
    this.editorMap.set(script.id, editor);
    this.initEditorEvent(editor, script.id);
    this.currentEditor = editor;
  }

  initEditorEvent(editor, id){

  }

  private initCustomerKey() {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      noSemanticValidation: false,
      noSyntaxValidation: false,
      allowJs: true,
      allowSyntheticDefaultImports: true,
      allowNonTsExtensions: true,
    });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(this.codeDeclareValue, 'filename/merkaba.d.ts');
  }
}
