import {AfterViewInit, Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit{

  ngAfterViewInit(){
    monaco.editor.create(document.getElementById('container')!, {
      value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
      language: 'javascript'
    });
  }
}
