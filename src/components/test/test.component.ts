import { Component } from '@angular/core';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  constructor() {

  }

  ngAfterViewInit(): void {
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
  }

}
