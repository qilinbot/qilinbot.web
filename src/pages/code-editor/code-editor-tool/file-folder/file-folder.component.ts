import {Component, ViewChild} from '@angular/core';
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzAutosizeDirective, NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";


import {
  NzTreeFlatDataSource,
  NzTreeFlattener,
  NzTreeViewComponent, NzTreeViewModule,
} from "ng-zorro-antd/tree-view";
import {FlatTreeControl} from '@angular/cdk/tree';
import {NzHighlightPipe} from "ng-zorro-antd/core/highlight";
import {FormsModule} from "@angular/forms";
import {NzNoAnimationDirective} from "ng-zorro-antd/core/no-animation";
import {CommonModule} from "@angular/common";
import {SelectionModel} from "@angular/cdk/collections";
import {CodeEditorService} from "../../../../services/code-editor.service";
import {MerkabaRecord, MerkabaScript} from "../../const/code-editor.page.const";
import {NzDrawerComponent, NzDrawerContentDirective} from "ng-zorro-antd/drawer";
import {NzFormControlComponent, NzFormDirective, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzSelectComponent, NzSelectModule} from "ng-zorro-antd/select";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {RenderService} from "../../../../core/render.service";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {MonacoService} from "../../../../services/monaco.service";
import {NzContextMenuService, NzDropDownDirective, NzDropdownMenuComponent} from "ng-zorro-antd/dropdown";
import {NzMenuDirective, NzMenuDividerDirective, NzMenuItemComponent, NzSubMenuComponent} from "ng-zorro-antd/menu";
import {BehaviorSubject} from "rxjs";

export enum EIconType {
  'xpa-wangzhan',
  'xpa-wenjianjia',
  'xpa-js'
}
interface FlatNode {
  id?: string;
  parentId?: string;
  type?: number;
  name?: string;
  title?: string;
  uri?: string;
  seq?: number
  devVersion?: number;
  prdVersion?: number
  parentRecord?: MerkabaRecord
  children?: Array<MerkabaRecord>
  isEditing: boolean

  // 提供树形结构去使用
  expandable: boolean;
  level: number;
  disabled: boolean;
}

@Component({
  selector: 'app-file-folder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTreeViewModule,
    NzInputGroupComponent,
    NzInputDirective,
    NzHighlightPipe,
    NzNoAnimationDirective,
    NzIconDirective,
    NzDrawerComponent,
    NzFormLabelComponent,
    NzFormDirective,
    NzRowDirective,
    NzFormControlComponent,
    NzColDirective,
    NzSelectComponent,
    NzDatePickerComponent,
    NzAutosizeDirective,
    NzButtonComponent,
    NzDrawerContentDirective,
    NzSelectModule,
    NzTooltipDirective,
    NzPopconfirmDirective,
    NzDropdownMenuComponent,
    NzMenuItemComponent,
    NzSubMenuComponent,
    NzMenuDividerDirective,
    NzMenuDirective,
    NzDropDownDirective,
  ],
  templateUrl: './file-folder.component.html',
  styleUrl: './file-folder.component.scss',
})
export class FileFolderComponent {
  iconType = EIconType;
  private fileData: MerkabaRecord[] = [];
  // 用于搜索
  searchValue$ = new BehaviorSubject<string>('');
  // 记录当前选中的结点
  currentSelectNode: FlatNode;
  // 记录当前结点展开的情况
  expandedNodeKeys: string[] = [];
  @ViewChild("treeView", {static: false}) treeView!: NzTreeViewComponent<FlatNode>;
  // 扁平化
  private transformer = (node: MerkabaRecord, level: number): FlatNode => ({
    ...node,
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    // parentRecord: node.parentRecord,
    level,
    disabled: false,
    isEditing: false,
  });
  selectListSelection = new SelectionModel<FlatNode>();

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new NzTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);
  constructor(private service: CodeEditorService, private render: RenderService, private monaco: MonacoService,private nzContextMenuService: NzContextMenuService) {
    this.service.load({}).subscribe(resp => {
      // todo 初始化monaco的所有模块 改成按需加载
      this.monaco.initModels(resp.items).then(r => this.monaco.scriptInitLoaded.next(true));
      this.fileData = resp.items;
      this.dataSource.setData(resp.items);
      console.log(resp.items);
    })
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  /**
   * 加载脚本编辑器  所有的加载全部通过路径去加载
   * @param e
   */
  toLoadScript(e){
    this.service.scriptChannel.next({type: 'openScript', script: e, uri: e.uri});
    this.service.scriptChannel.next({type: 'switchScript', script: e});
  }

  /**
   *
   */
  showContextMenu(event: MouseEvent, node){
    event.preventDefault();
    event.stopPropagation();
    this.selectListSelection.toggle(node);
    this.currentSelectNode = node;  // 记录当前选中的结点
  }

  /**
   *
   */
  onContextMenu(event, view, node){
    this.nzContextMenuService.create(event, view);
    console.log(node)
  }

  stopEditing(node: any){
    node.idEditing = false;
  }

  confirmEdit(node: any): void {
    node.isEditing = false;
    // 在这里保存修改后的名称，执行更新逻辑
    console.log(`Updated name: ${node.name}`);
  }

  /**
   * 在添加文件的时候， 如果选中文件夹则在他的创建文件与子节点，如果选中文件的话，直接在他的同级创建
   * 当前只是创建一个创建窗口 只有在输入了文件名之后才能 创建成功 否则失败
   */
  addNode(type: number){
    console.log(this.currentSelectNode, this.selectListSelection.selected);
    const newNode: FlatNode = { //
      expandable: type === 1,   // type 1 文件夹  2 为文件
      level: this.currentSelectNode.level + 1,
      disabled: false,
      isEditing: true,
    }
    // 然后添加到tree中
    this.currentSelectNode.children.unshift(newNode);
    this.dataSource.getData()
    console.log(this.dataSource.getData());
    console.log(this.fileData);
    this.dataSource.setData(this.fileData);
  }

  //
  refreshData(newData: FlatNode[]){

  }

  saveExpandedState(): void {
    this.expandedNodeKeys = [];
    this.treeControl.dataNodes.forEach(node => {
      if (this.treeControl.isExpanded(node)) {
        this.expandedNodeKeys.push(node.id);
      }
    });
    console.log('Expanded Node Keys:', this.expandedNodeKeys);
  }


  restoreExpandedState(): void {
    this.expandedNodeKeys.forEach(key => {
      const node = this.findNodeByKey(key, this.treeControl.dataNodes);
      if (node) {
        this.treeControl.expand(node);
      }
    });
  }

  findNodeByKey(key: string, nodes: FlatNode[]): FlatNode | null {
    for (const node of nodes) {
      if (node.id === key) {
        return node;
      }
    }
    return null;
  }



  /**
   *下载脚本代码
   */
  downloadFile() {
    // todo 下载功能放在这可能会选中文件夹
    let downloadRecord = this.selectListSelection.selected[0];
    this.service.readScript(downloadRecord.id).subscribe((resp: MerkabaScript) => {
      const data = resp.content;
      console.log(data);
      const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resp.name + '-' + resp.version + ".js";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  /**
   * 脚本新版本的发布
   */
  publishScript(node: FlatNode) {
    this.service.publishScript(node.id).subscribe(resp => {
      let record = this.selectListSelection.selected[0];
      record.prdVersion = resp.version;

      // 更新本地树节点数据
      this.updateNodeVersion(this.fileData, node.id, resp.version);

      // 重新设置数据源以刷新 TreeView
      this.dataSource.setData(this.fileData);

      this.render.success("发布成功");
    });
  }

 // 更新本地树节点的版本号
  updateNodeVersion(nodes: MerkabaRecord[], nodeId: string, newVersion: number) {
    for (let node of nodes) {
      if (node.id === nodeId) {
        node.prdVersion = newVersion;
        break;
      }
      if (node.children && node.children.length > 0) {
        this.updateNodeVersion(node.children, nodeId, newVersion);
      }
    }
  }
}
