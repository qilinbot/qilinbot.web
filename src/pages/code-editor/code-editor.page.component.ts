import {Component, OnDestroy, ViewChild} from '@angular/core';
import {SplitAreaComponent, SplitComponent} from "angular-split";
import {CodeEditorToolComponent} from "./code-editor-tool/code-editor-tool.component";
import {ScriptEditorComponent} from "../../components/script-editor/script-editor.component";
import {CodeEditorBodyComponent} from "./code-editor-body/code-editor-body.component";
import {CodeEditorLogComponent} from "./code-editor-log/code-editor-log.component";
import {MonacoService} from "../../services/monaco.service";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-code-editor.page',
  standalone: true,
  imports: [
    SplitComponent,
    SplitAreaComponent,
    CodeEditorToolComponent,
    ScriptEditorComponent,
    CodeEditorBodyComponent,
    CodeEditorLogComponent,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './code-editor.page.component.html',
  styleUrl: './code-editor.page.component.scss'
})
export class CodeEditorPageComponent implements  OnDestroy{
  @ViewChild('runningLog') runningLog: CodeEditorLogComponent;
  loaded: boolean = false;
  constructor(public monaco: MonacoService) {
    this.monaco.scriptInitLoaded.subscribe((loaded) => {
      this.loaded = loaded;
      console.log(this.loaded)
    })
  }

  ngOnDestroy(): void {
    this.runningLog.cancelAllInstance();
  }

}
