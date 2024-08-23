import { Component } from '@angular/core';
import {SplitAreaComponent, SplitComponent} from "angular-split";
import {CodeEditorToolComponent} from "./component/code-editor-tool/code-editor-tool.component";

@Component({
  selector: 'app-code-editor.page',
  standalone: true,
  imports: [
    SplitComponent,
    SplitAreaComponent,
    CodeEditorToolComponent
  ],
  templateUrl: './code-editor.page.component.html',
  styleUrl: './code-editor.page.component.scss'
})
export class CodeEditorPageComponent {

  handleClick(e){
    console.log(e);
  }

}
