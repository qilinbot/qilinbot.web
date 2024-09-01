import { Component, ElementRef, ViewChild } from '@angular/core';
import * as monaco from 'monaco-editor';

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
    // 注册 TypeScript 和 JavaScript 语言支持
    monaco.languages.register({ id: 'javascript' });
    monaco.languages.register({ id: 'typescript' });

    const models = {
      'file:///main.ts': monaco.editor.createModel(`
    import { sayHello } from './hello.ts';
    sayHello();
  `, 'javascript', monaco.Uri.parse('file:///main.ts')),

      'file:///hello.ts': monaco.editor.createModel(`
    export function sayHello() {
      console.log('Hello World');
    }
  `, 'javascript', monaco.Uri.parse('file:///hello.ts'))
    };

    const editor = monaco.editor.create(this.editorContainer.nativeElement, {
      model: models['file:///main.ts'],
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true
    });

    this.initEvent(editor, models);
  }

  initEvent(editor: monaco.editor.IStandaloneCodeEditor, models: any): void {
    editor.onMouseDown(async (event) => {
      const position = event.target.position;

      if (position) {
        try {
          const targetModelUri = await this.getTargetModelUri(position, editor);
          console.log(targetModelUri);
          if (targetModelUri && targetModelUri !== editor.getModel()?.uri.toString() && models[targetModelUri]) {
            editor.setModel(models[targetModelUri]);
          }
        } catch (err) {
          console.error('Error occurred while navigating to declaration:', err);
        }
      }
    });
  }

  async getTargetModelUri(position: monaco.Position, editor: monaco.editor.IStandaloneCodeEditor): Promise<string | null> {
    const model = editor.getModel();
    if (!model) return null;

    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    const client = await worker(model.uri);

    const definitions = await client.getDefinitionAtPosition(model.uri.toString(), 1);

    if (definitions && definitions.length > 0) {
      const target = definitions[0];
      const targetUri = target.uri;
      return targetUri.toString();
    }

    return null;
  }
}
