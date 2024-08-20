import {AfterViewInit, Component} from '@angular/core';
import * as monaco from "monaco-editor";

@Component({
  selector: 'app-script-editor',
  standalone: true,
  imports: [],
  templateUrl: './script-editor.component.html',
  styleUrl: './script-editor.component.scss'
})
export class ScriptEditorComponent implements AfterViewInit{
  ngAfterViewInit(){
    monaco.editor.create(document.getElementById('container')!, {
      value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
      language: 'javascript'
    });
  }
}
