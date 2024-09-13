import { Component } from '@angular/core';
import {NzButtonComponent, NzButtonGroupComponent} from "ng-zorro-antd/button";
import {JsonEditorComponent} from "../../../../components/json-editor/json-editor.component";
import {CommonModule, NgClass, NgForOf} from "@angular/common";
import {ArgusConfig} from "./argus-config.const";
import {NzSwitchComponent} from "ng-zorro-antd/switch";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-editor-settings',
  standalone: true,
  imports: [
    NzButtonGroupComponent,
    NzButtonComponent,
    JsonEditorComponent,
    CommonModule,
    NzSwitchComponent,
    FormsModule
  ],
  templateUrl: './editor-settings.component.html',
  styleUrl: './editor-settings.component.scss'
})
export class EditorSettingsComponent {
  mode: 'code' | 'view' = "code";

  protected readonly ArgusConfig = ArgusConfig;
}
