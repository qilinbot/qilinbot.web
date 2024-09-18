import {Component, ElementRef, ViewChild} from '@angular/core';
import {NzButtonComponent, NzButtonGroupComponent} from "ng-zorro-antd/button";
import {CommonModule} from "@angular/common";
import {ArgusConfig} from "./argus-config.const";
import {NzSwitchComponent} from "ng-zorro-antd/switch";
import {FormsModule} from "@angular/forms";
import {NgxJsonViewerModule} from "ngx-json-viewer";
import {AceComponent, AceModule,} from "ngx-ace-wrapper";

@Component({
  selector: 'app-editor-settings',
  templateUrl: './editor-settings.component.html',
  styleUrl: './editor-settings.component.scss',
  imports: [
    NgxJsonViewerModule,
    NzSwitchComponent,
    CommonModule,
    FormsModule,
    AceModule
  ],
  standalone: true
})
export class EditorSettingsComponent {
  @ViewChild('jsonEditor') jsonEditor : AceComponent;
  mode: 'code' | 'view' = "code";
  data = {
    'simple key': 'simple value',
    numbers: 1234567,
    'simple list': ['value1', 22222, 'value3'],
    'special value': undefined,
    owner: null,
    'simple obect': {
      'simple key': 'simple value',
      numbers: 1234567,
      simple: ['value1', 22222, 'value3'],
      'simple obect': {
        key1: 'value1',
        key2: 22222,
        key3: 'value3',
      },
    },
  };
  get code(){
    return JSON.stringify(this.data, null, 2);
  }


  // 只有在按下

  set code(data){
    // todo 报错
    this.data = JSON.parse(data)
    console.log(this.data);
    // try {
    //
    // } catch (e) {
    //   console.error("occored error when typing the JSON", e);
    // }
  }

  config;

  ngAfterViewInit(){
    let config = this.jsonEditor.getConfig()
    console.log(config);
  }
  protected readonly ArgusConfig = ArgusConfig;
}
