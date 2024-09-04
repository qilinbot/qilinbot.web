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
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      allowJs: true,
      checkJs: true,
      noEmit: true,
    });

// extra libraries
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
                /**
                 * @typedef {Object} MyType
                 * @property {string} name - The name of the person.
                 * @property {number} age - The age of the person.
                 */
            `, '@types/mytypes.d.ts');


    var jsCode =  `/**
 * @param {MyType} person - The person object
 */
function greet(person) {
    return 'Hello ' + person.name;
}`

    const model = monaco.editor.createModel(jsCode, 'typescript', Uri.parse('file:///app.ts'));


    monaco.editor.create(this.editorContainer.nativeElement, {
      model: model,
      language: "typescript",
      automaticLayout: true,
    });
  }
}
