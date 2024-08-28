import { Component } from '@angular/core';
import {SplitAreaComponent, SplitComponent} from "angular-split";
import {CodeEditorToolComponent} from "./code-editor-tool/code-editor-tool.component";
import {ScriptEditorComponent} from "../../components/script-editor/script-editor.component";
import {CodeEditorBodyComponent} from "./code-editor-body/code-editor-body.component";

@Component({
  selector: 'app-code-editor.page',
  standalone: true,
  imports: [
    SplitComponent,
    SplitAreaComponent,
    CodeEditorToolComponent,
    ScriptEditorComponent,
    CodeEditorBodyComponent
  ],
  templateUrl: './code-editor.page.component.html',
  styleUrl: './code-editor.page.component.scss'
})
export class CodeEditorPageComponent {


}
