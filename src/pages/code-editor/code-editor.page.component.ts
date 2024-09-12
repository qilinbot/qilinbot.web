import {Component, OnDestroy, ViewChild} from '@angular/core';
import {SplitAreaComponent, SplitComponent} from "angular-split";
import {CodeEditorToolComponent} from "./code-editor-tool/code-editor-tool.component";
import {ScriptEditorComponent} from "../../components/script-editor/script-editor.component";
import {CodeEditorBodyComponent} from "./code-editor-body/code-editor-body.component";
import {CodeEditorLogComponent} from "./code-editor-log/code-editor-log.component";
import {MonacoService} from "../../services/monaco.service";
import {AsyncPipe, Location, NgClass, NgForOf, NgIf, NgStyle, NgTemplateOutlet} from "@angular/common";
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
import {NzMenuDirective, NzMenuDividerDirective, NzMenuItemComponent, NzSubMenuComponent} from "ng-zorro-antd/menu";
import {SelectComponent} from "../../components/select/select.component";

@Component({
  selector: 'app-code-editor-page',
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
    NgStyle,
    NzMenuDirective,
    NzMenuItemComponent,
    NzSubMenuComponent,
    NzMenuDividerDirective,
    SelectComponent
  ],
  templateUrl: './code-editor.page.component.html',
  styleUrls: ['./code-editor.page.component.scss']
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

  options = [
    { value: 'man.js V1.28', name: 'man.js', version: 'V1.28' },
    { value: 'lucy', name: 'Lucy', version: 'V1.0' },
    { value: 'disabled', name: 'Disabled', version: 'V1.0', disabled: true }
  ];

  selectedOption = this.options[0];  // 绑定整个对象，初始状态为空


  allScripts: MerkabaScript[];

  constructor(public monaco: MonacoService, private location: Location) {
    this.monaco.scriptInitLoaded.subscribe((loaded) => {
      this.loaded = loaded;

      this.allScripts = Array.from(this.monaco.editorScript.values());

      console.log(this.allScripts, this.selectedScript)
      console.log(this.loaded)
    })

  }

  runScriptChange(e){
    // todo 获取当前选中要运行的脚本
    console.log(e);
  }

  ngOnDestroy(): void {
    this.runningLog.cancelAllInstance();
  }

  goBack(){
    this.location.back();

  }

}
