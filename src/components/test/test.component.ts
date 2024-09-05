import { Component, ElementRef, ViewChild } from '@angular/core';
import * as monaco from 'monaco-editor';
import { Uri } from 'monaco-editor';
interface FileModel {
  filename: string;
  content: string;
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  standalone: true,
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  editorOptions = { theme: 'vs-dark', language: 'typescript' };
  editor: monaco.editor.IStandaloneCodeEditor | undefined;

  files: FileModel[] = [
    { filename: 'file:///file1.ts', content: 'export function foo() { return "Hello from File 1"; }' },
    { filename: 'file:///file2.ts', content: 'import { foo } from "./file1"; console.log(foo());' },
  ];
  currentFile: FileModel = this.files[1]; // 默认展示 file2.ts

  ngOnInit() {
    this.initEditor();
  }

  initEditor() {
    // 初始化 Monaco Editor
    this.editor = monaco.editor.create(document.getElementById('container')!, {
      value: this.currentFile.content,
      language: 'typescript',
    });

    // 注册 TypeScript 语言服务配置
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      module: monaco.languages.typescript.ModuleKind.ESNext,
    });

    // 添加额外的文件作为依赖，提供语言服务支持
    this.files.forEach(file => {
      monaco.editor.createModel(file.content, 'typescript', monaco.Uri.parse(file.filename));
    });

    // 添加点击跳转功能
    this.addGoToDefinition();
  }

  // 切换文件
  switchFile(file: FileModel) {
    this.currentFile = file;
    const model = monaco.editor.getModels().find(m => m.uri.path === `/${file.filename}`);
    if (model) {
      this.editor?.setModel(model);
    }
  }

  // 实现点击跳转到函数声明
  addGoToDefinition() {
    this.editor?.onMouseDown((e) => {
      if (e.target?.element?.className.includes('mtk')) { // 点击代码文本区域
        const position = e.target.position; // 获取点击位置
        if (position) {
          const model = this.editor?.getModel();
          const word = model?.getWordAtPosition(position);

          console.log(model, word);

          if (word) {
            // 使用 `getDefinitionAtPosition` 跳转到定义
            monaco.languages.typescript.getTypeScriptWorker().then(worker => {
              worker(model?.uri).then(client => {
                client.getDefinitionAtPosition(model?.uri.toString(), position.column - 1).then((result) => {
                  if (result && result.length > 0) {
                    const target = result[0];
                    const targetUri = monaco.Uri.parse(target.fileName);
                    console.log("targetUri", targetUri)
                    const targetRange = target.textSpan;

                    // 创建或获取目标文件的Model，并跳转到相应位置
                    let targetModel = monaco.editor.getModel(targetUri);
                    // console.log("targetModel", targetModel)
                    if (!targetModel) {
                      const targetContent = this.files.find(f => f.filename === targetUri.path)?.content;
                      if (targetContent) {
                        targetModel = monaco.editor.createModel(targetContent, 'typescript', targetUri);
                      }
                    }
                    if (targetModel) {
                      this.editor.setModel(targetModel); // 切换文件
                      this.editor?.setPosition({
                        column: targetRange.start + 1,
                        lineNumber: targetRange.startLine
                      });
                      this.editor?.revealPositionInCenter({
                        column: targetRange.start + 1,
                        lineNumber: targetRange.startLine
                      });
                    }
                  }
                });
              });
            });
          }
        }
      }
    });
  }
}
