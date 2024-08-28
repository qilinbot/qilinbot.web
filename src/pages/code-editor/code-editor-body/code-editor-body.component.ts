import { Component } from '@angular/core';
import {TabsModule} from "ng-devui";
import {CommonModule, NgClass, NgForOf, NgStyle} from "@angular/common";
import {NzTabComponent, NzTabSetComponent} from "ng-zorro-antd/tabs";
import {CodeEditorService} from "../../../services/code-editor.service";
import {MonacoService} from "../../../services/monaco.service";
import {MerkabaScript} from "../const/code-editor.page.const";
import {NzSwitchComponent} from "ng-zorro-antd/switch";
import {FormsModule} from "@angular/forms";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {NzCascaderComponent} from "ng-zorro-antd/cascader";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";

@Component({
  selector: 'app-code-editor-body',
  standalone: true,
  imports: [
    TabsModule,
    NgForOf,
    NzTabSetComponent,
    NzTabComponent,
    NgStyle,
    NgClass,
    CommonModule,
    NzSwitchComponent,
    FormsModule,
    NzButtonComponent,
    NzTooltipDirective,
    NzCascaderComponent,
    NzSelectComponent,
    NzOptionComponent,
  ],
  templateUrl: './code-editor-body.component.html',
  styleUrl: './code-editor-body.component.scss'
})
export class CodeEditorBodyComponent {
  scripts: Array<MerkabaScript> = [];
  scriptTabs  = [];
  currentScriptIndex = 0;
  prepareRunScriptId: string;

  // 是否开启vnc
  enabledVNC: boolean = false

  runningScriptInstance = {
    jobId: '',
    deviceId: '',
  }

  get currentScript() {
    return this.scripts[this.currentScriptIndex]
  }


  constructor(public service: CodeEditorService, public monacoService: MonacoService) {
    this.service.scriptChannel.subscribe(e => {
      console.log(e);
      switch (e.type){
        case "openScript":
          if(e.script.type !== 2) return;
          this.openScriptEditor(e.script);
          break;
      }
    })
  }

  openScriptEditor(data: MerkabaScript): void {
    if(!data.id) return;
    console.log(data);
    this.prepareRunScriptId = data.id;
    this.service.readScript(data.id).subscribe(resp => {
      let script: MerkabaScript = resp as MerkabaScript;
      script.changed = false;
      script.name = data.name;
      script.vncEnabled = script.vncEnabled || false;
      let index = this.scripts.findIndex(item => item.id === data.id);
      if(index < 0){
        this.scriptTabs.push({id: script.id, name: script.name});
        index = this.scripts.push(script) - 1;
      }
      this.currentScriptIndex = index;
      if (document.querySelector(`.editor-${script.id} .monaco-editor`)) {
        this.updateInfoOfScript(script)
        return;
      }
      setTimeout( async () => {
        let element: any = document.querySelector(`.editor-${script.id}`);
        this.monacoService.createEditor(script, element, data.content);
        this.updateInfoOfScript(script)
      }, 150)
    })
  }

  async updateInfoOfScript(script: MerkabaScript) {
    if(!this.currentScript) return;
    let scriptOutLine = await this.monacoService.getCurrentScriptMenuById(this.currentScript.id);
    this.service.scriptChannel.next({ type: 'currentScript', script: script || this.currentScript, scriptOutLine })
  }

  closeTab({ index }: { index: number }): void {
    this.scriptTabs.splice(index, 1);
  }

  newTab(): void {
    // this.tabs.push('New Tab');
    // this.selectedIndex = this.tabs.length;
  }

  changeEnabledVNC(){
    console.log(this.enabledVNC, "changeEnabledVNC")
  }

  runScript(){
    console.log("runScript");

  }

  stopScript(){
    console.log("stopScript");
  }
}
