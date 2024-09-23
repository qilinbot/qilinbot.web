import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
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
import {NzFormatEmitEvent, NzTreeComponent, NzTreeNode, NzTreeNodeOptions} from "ng-zorro-antd/tree";
import {EditInputComponent} from "../../../../components/edit-input/edit-input.component";
import {
  ContenteditableInputComponent
} from "../../../../components/contenteditable-input/contenteditable-input.component";
import {NzModalComponent, NzModalContentDirective} from "ng-zorro-antd/modal";

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
    NzTreeComponent,
    EditInputComponent,
    ContenteditableInputComponent,
    NzModalComponent,
    NzModalContentDirective,
  ],
  templateUrl: './file-folder.component.html',
  styleUrl: './file-folder.component.scss',
})
export class FileFolderComponent {
  // 默认创建的文件类型
  fileType
  @ViewChild('newName') newName: ElementRef
  searchValue = '';
  nodes: NzTreeNodeOptions[] = [];

  activatedNode?: NzTreeNode;
  constructor(private service: CodeEditorService, private render: RenderService, private monaco: MonacoService,private nzContextMenuService: NzContextMenuService) {
    this.service.load({}).subscribe(resp => {
      // todo 初始化monaco的所有模块 改成按需加载
      this.monaco.initModels(resp.items).then(r => this.monaco.scriptInitLoaded.next(true));
      // todo 实现构成nodes树状结构
      console.log(resp.items)
      console.log(this.transformNodes(resp.items))
      this.nodes = this.transformNodes(resp.items);

    })
  }

  transformNodes(dataSource, path='0'): NzTreeNodeOptions[]{
    const list = [];
    for (let i = 0 ;i < dataSource.length; i++) {
      const key = dataSource[i].title;
      const treeNode: NzTreeNodeOptions = {
        ...dataSource[i],
        title: dataSource[i].name,
        key: dataSource[i].name,
        expanded: false,
        children: [],
        isLeaf: false,
      }
      if(dataSource[i].children){
        treeNode.children = this.transformNodes(dataSource[i].children, dataSource[i].title)
      }else{
        treeNode.isLeaf = true;
      }
      list.push(treeNode);
    }
    return list;
  }

  /**
   * 激活节点
   * @param data
   */
  activeNode(data: NzFormatEmitEvent): void {
    this.activatedNode = data.node!;
    console.log(this.activatedNode);
  }

  selectFileType(fileType: number){
    this.fileType = fileType;
    this.isVisible = true;
  }



  /**
   * 右键创建菜单
   * @param $event
   * @param menu
   * @param node
   */
  contextMenu($event, menu: NzDropdownMenuComponent, node): void {

    this.activatedNode = node!;
    console.log(this.activatedNode);
    this.nzContextMenuService.create($event, menu);
  }

  /**
   * 打开文件夹
   * 是文件夹就打开 是文件双击打开文件
   * @param data
   */
  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    // do something if u want
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
      this.service.scriptChannel.next({type: 'openScript', script: data.node.origin , uri: data.node.origin['uri']});
      this.service.scriptChannel.next({type: 'switchScript', script: data.node.origin});
    }
  }

  nzEvent(event: NzFormatEmitEvent): void {
    console.log(event);
  }

  isVisible = false;

  handleEnter(name){
    console.log()
    switch (this.fileType){
      case 1:
        this.createFile(name, this.fileType)
        break;
      case 2:
        this.createFile(name, this.fileType);
        break;
      case 3:
        this.rename(name);
    }
    this.isVisible = false;
  }

  clearSearch(){
    console.log("exe")
    this.searchValue = ' ';
    console.log(this.searchValue)
  }

  /**
   * 创建文件，文件夹
   * @param name
   * @param type
   */
  createFile(name, type){
    // todo 创建文件同步到服务器
    // this.service.

    const node: NzTreeNodeOptions = {
      title: name,
      key: name,
      expanded: false,
      children: [],
      isLeaf: true,
      type: type,  //新建文件
    }
    this.activatedNode.isLeaf = false;
    this.activatedNode.origin.isLeaf = false;
    this.activatedNode.addChildren([node], this.activatedNode.children.length)
  }

  /**
   * 给文件，文件夹重命名
   */
  rename(name: string){
    this.activatedNode.title = name;
    this.activatedNode.key = name;
    // todo 同步服务器
  }

  /**
   * 删除文件或文件夹
   */
  delete(){
    this.activatedNode.remove();

    // todo 同步服务器
    // this.service.
  }

  /**
   * 发布新的脚本
   */
  publish(){
    // todo 发布新的脚本
    this.service.publishScript(this.activatedNode.origin['id']).subscribe(resp => {
      console.log(resp)
      this.activatedNode.origin['prdVersion'] = resp.version;
    })
  }

  /**
   *下载脚本代码
   */
  // downloadFile() {
  //   // todo 下载功能放在这可能会选中文件夹
  //   let downloadRecord = this.selectListSelection.selected[0];
  //   this.service.readScript(downloadRecord.id).subscribe((resp: MerkabaScript) => {
  //     const data = resp.content;
  //     console.log(data);
  //     const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = resp.name + '-' + resp.version + ".js";
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   });
  // }

}
