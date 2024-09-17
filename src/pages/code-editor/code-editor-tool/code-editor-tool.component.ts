import {AfterViewInit, Component, TemplateRef, ViewChild} from '@angular/core';
import {SplitAreaComponent, SplitComponent} from "angular-split";
import {ITool, tools} from "./tools.const";
import {NgClass, NgForOf, NgIf, NgTemplateOutlet} from "@angular/common";
import {CodeEditorService} from "../../../services/code-editor.service";
import {NzTreeViewModule} from "ng-zorro-antd/tree-view";
import {FileFolderComponent} from "./file-folder/file-folder.component";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzDrawerComponent} from "ng-zorro-antd/drawer";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {MatTab, MatTabGroup, MatTabLabel} from "@angular/material/tabs";
import {MatIcon} from "@angular/material/icon";
import {VariableWatcherComponent} from "./variable-watcher/variable-watcher.component";
import {EditorSettingsComponent} from "./editor-settings/editor-settings.component";
import {OutlineTreeComponent} from "./outline-tree/outline-tree.component";
import {NzTabComponent, NzTabSetComponent} from "ng-zorro-antd/tabs";
import {NzContextMenuService, NzDropdownMenuComponent} from "ng-zorro-antd/dropdown";
import {NzMenuDirective, NzMenuItemComponent} from "ng-zorro-antd/menu";
@Component({
  selector: 'app-code-editor-tool',
  standalone: true,
  imports: [
    SplitAreaComponent,
    NgClass,
    NgForOf,
    SplitComponent,
    NgIf,
    NzTreeViewModule,
    FileFolderComponent,
    NzButtonComponent,
    NzDrawerComponent,
    NzIconDirective,
    NzInputDirective,
    NzInputGroupComponent,
    MatTab,
    MatTabGroup,
    MatIcon,
    MatTabLabel,
    VariableWatcherComponent,
    EditorSettingsComponent,
    OutlineTreeComponent,
    NgTemplateOutlet,
    NzTabComponent,
    NzTabSetComponent,
    NzDropdownMenuComponent,
    NzMenuDirective,
    NzMenuItemComponent,
  ],
  templateUrl: './code-editor-tool.component.html',
  styleUrl: './code-editor-tool.component.scss'
})
export class CodeEditorToolComponent implements AfterViewInit {
  // 获取标签页的元素引用
  @ViewChild('fileFolder', { static: true }) fileFolder!: TemplateRef<any>;
  @ViewChild('variableWatcher', { static: true }) variableWatcher!: TemplateRef<any>;
  @ViewChild('editorSettings', { static: true }) editorSettings!: TemplateRef<any>;
  @ViewChild('outlineTree', { static: true }) outlineTree!: TemplateRef<any>;

  @ViewChild('fileFolderComponent') fileFolderComponent: FileFolderComponent
  protected readonly tools = tools;
  showTool = false;


  // 上一次选中的工具下标
  lastActiveToolIndex: number = 0

  constructor(
    public service: CodeEditorService,
    private nzContextMenuService: NzContextMenuService
  ) {
    this.changeToolStatus(this.tools[0], 0)
    this.service.windowChannel.subscribe(res => {
      if (res.name != "tool") return
      const index = this.tools.findIndex(item => item.isActive)
      if (index > -1) {
        this.lastActiveToolIndex = index
        this.tools.forEach(item => item.isActive = false)
        this.service.windowChannel.next({name: 'toolWidth', value: 50})
      } else {
        console.log(this.lastActiveToolIndex)
        this.tools[this.lastActiveToolIndex].isActive = true;
        this.service.windowChannel.next({name: 'toolWidth', value: 330})
      }
    });
  }

  ngAfterViewInit() {
    this.tools.map(item => item.component = this[item.component])
    console.log(this.tools);

  }

  changeToolStatus(tool: ITool, index: number) {
    tool.isActive = !tool.isActive
    this.showTool = this.tools.some(item => item.isActive)
    if (!tool.isActive) {
      const index = this.tools.findIndex(item => item.isActive)
      if (index > -1) return
      this.service.windowChannel.next({name: 'toolWidth', value: 50})
    } else {
      this.lastActiveToolIndex = index
      this.service.windowChannel.next({name: 'toolWidth', value: 330})
    }
  }

  onContextMenu(event, view){
    this.nzContextMenuService.create(event, view);
  }

}
