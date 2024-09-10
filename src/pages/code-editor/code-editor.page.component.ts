import {Component, OnDestroy, ViewChild} from '@angular/core';
import {SplitAreaComponent, SplitComponent} from "angular-split";
import {CodeEditorToolComponent} from "./code-editor-tool/code-editor-tool.component";
import {ScriptEditorComponent} from "../../components/script-editor/script-editor.component";
import {CodeEditorBodyComponent} from "./code-editor-body/code-editor-body.component";
import {CodeEditorLogComponent} from "./code-editor-log/code-editor-log.component";
import {MonacoService} from "../../services/monaco.service";
import {AsyncPipe, NgClass, NgForOf, NgIf, NgStyle, NgTemplateOutlet} from "@angular/common";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzCascaderComponent} from "ng-zorro-antd/cascader";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {NzSwitchComponent} from "ng-zorro-antd/switch";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {FormsModule} from "@angular/forms";
import {MerkabaScript} from "./const/code-editor.page.const";
import {GeoIPDashboardComponent} from "../../components/geo-ipdashboard/geo-ipdashboard.component";
import {NzDropDownADirective, NzDropDownDirective, NzDropdownMenuComponent} from "ng-zorro-antd/dropdown";
import {NzIconDirective} from "ng-zorro-antd/icon";

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
    NgIf,
    NgForOf,
    NzButtonComponent,
    NzCascaderComponent,
    NzOptionComponent,
    NzSelectComponent,
    NzSwitchComponent,
    NzTooltipDirective,
    FormsModule,
    GeoIPDashboardComponent,
    NzDropdownMenuComponent,
    NzDropDownADirective,
    NzDropDownDirective,
    NzIconDirective,
    NgTemplateOutlet,
    NgClass,
    NgStyle
  ],
  templateUrl: './code-editor.page.component.html',
  styleUrl: './code-editor.page.component.scss'
})
export class CodeEditorPageComponent implements OnDestroy {
  @ViewChild('runningLog') runningLog: CodeEditorLogComponent;
  loaded: boolean = false;

  isRunning: boolean = false;

  // 当前选中要执行的代码内容
  selectedScript: MerkabaScript = {
    id: '22222222',
    name: 'Mian.js',
    content: 'console.log("Hello World")',
    changed: false,
    parameters: "11",
    breakPoints: [],
    version: 1231,
    proxy: '12'
  };


  allScripts: MerkabaScript[];

  constructor(public monaco: MonacoService) {
    this.monaco.scriptInitLoaded.subscribe((loaded) => {
      this.loaded = loaded;

      this.allScripts = Array.from(this.monaco.editorScript.values());

      console.log(this.allScripts, this.selectedScript)
      console.log(this.loaded)
    })

  }

  ngOnDestroy(): void {
    this.runningLog.cancelAllInstance();
  }

}
