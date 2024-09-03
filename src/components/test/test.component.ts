import { Component, ElementRef, ViewChild } from '@angular/core';
import * as monaco from 'monaco-editor';
import { Uri } from 'monaco-editor';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  standalone: true,
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    // 注册 JavaScript 和 TypeScript 语言
    monaco.languages.register({ id: 'typescript' });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      allowJs: true,
      checkJs: true,
      noEmit: true
    });


    // 添加 JSDoc 类型定义和 Person 类声明
    monaco.languages.typescript.typescriptDefaults.addExtraLib(`
      /**
       * @typedef {Object} Person
       * @property {string} someProperty - 示例属性
       * @property {function(): void} someMethod - 示例方法
       */
      declare class Person {
          constructor();
          someProperty: string;
          someMethod(): void;
      }
    `, 'file:///Person.d.ts');

    // 创建模型
    const model = monaco.editor.createModel(`
      /**
       * @param {Person} p
       */
      function test(p) {
          p.someProperty;
          p.someMethod();
      }
    `, 'typescript', Uri.parse('file:///main.ts'));

    // 创建编辑器
    const editor = monaco.editor.create(this.editorContainer.nativeElement, {
      model: model,
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true
    });
    // 还是无法实现
  }
}
