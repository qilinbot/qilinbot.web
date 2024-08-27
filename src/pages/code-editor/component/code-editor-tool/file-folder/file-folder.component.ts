import {Component, ViewChild} from '@angular/core';
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzAutosizeDirective, NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";


import {
  NzTreeFlatDataSource,
  NzTreeFlattener,
  NzTreeNodeComponent,
  NzTreeNodeDefDirective,
  NzTreeNodeNoopToggleDirective,
  NzTreeNodeOptionComponent,
  NzTreeNodePaddingDirective,
  NzTreeNodeToggleRotateIconDirective, NzTreeView,
  NzTreeViewComponent, NzTreeViewModule,
} from "ng-zorro-antd/tree-view";
import { FlatTreeControl } from '@angular/cdk/tree';
import {NzHighlightPipe} from "ng-zorro-antd/core/highlight";
import {FormsModule} from "@angular/forms";
import {NzNoAnimationDirective} from "ng-zorro-antd/core/no-animation";
import {CommonModule} from "@angular/common";
import {SelectionModel} from "@angular/cdk/collections";
import {CodeEditorService} from "../../../../../services/code-editor.service";
import {MerkabaRecord, MerkabaScript} from "../../../const/code-editor.page.const";
import {NzDrawerComponent, NzDrawerContentDirective} from "ng-zorro-antd/drawer";
import {NzFormControlComponent, NzFormDirective, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzSelectComponent, NzSelectModule} from "ng-zorro-antd/select";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {DialogService} from "ng-devui";
import {FileEditModalComponent} from "../file-edit-modal/file-edit-modal.component";


interface FlatNode {
  id?: string;
  parentId?: string;
  type?: number;
  name?: string;
  title?: string;
  uri?: string;
  seq?:number
  devVersion?:number;
  prdVersion?:number
  parentRecord?:MerkabaRecord
  children?:Array<MerkabaRecord>

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
  ],
  templateUrl: './file-folder.component.html',
  styleUrl: './file-folder.component.scss',
})
export class FileFolderComponent {
  @ViewChild("treeView", {static: false}) treeView!: NzTreeViewComponent<FlatNode>;
  // 扁平化
  private transformer = (node: MerkabaRecord, level: number): FlatNode => ({
    ...node,
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level,
    disabled: false,
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

  constructor(private service: CodeEditorService,private dialogService: DialogService) {
    this.service.load({}).subscribe(resp => {
      this.dataSource.setData(resp.items);
    })
    // this.dataSource.setData(TREE_DATA);
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;


  /**
   * 新建文件
   */
  addNewFile(){
    const parseParentId = (node: FlatNode) => {
      if(!node) return "";
      else{
        switch (node.type){
          case 0:
          case 1:
            return node.id
          default:
            return node.parentId || node.id;
        }
      }
    }
    const getRecord = (node: FlatNode): MerkabaRecord => {
      if(node){
        delete node.disabled;
        delete node.expandable;
        delete node.level;
      }
      return node;
    }
    console.log(this.selectListSelection.selected)
    let selectedNode = this.selectListSelection.selected;
    let parentRecord = this.selectListSelection.selected
    let parentId = parseParentId(selectedNode[0]);
    let newFile: MerkabaRecord = {parentId, id: '', name: '', parentRecord: getRecord(parentRecord[0])}
    this.updateFile(newFile, false, 'add');
  }

  editFile(){
    let editRecord = this.selectListSelection.selected[0];
    // todo bug
    if(editRecord.parentId) {
      editRecord.parentRecord = this.selectListSelection.selected[0].parentRecord;
    }
    this.updateFile(editRecord, true, 'modify');
  }

  updateFile(data: MerkabaRecord, isEdit: boolean = false, type: 'add' | 'modify'){
    const results = this.dialogService.open({
      id: 'dialog-service',
      width: '500px',
      maxHeight: '500px',
      title: '新建文件',
      content: FileEditModalComponent,
      dialogtype: 'standard',
      // beforeHidden: () => this.beforeHidden(),

      backdropCloseable: true,
      buttons: [
        {
          cssClass: 'common',
          text: '取消',
          handler: ($event: Event) => {
            results.modalInstance.hide();
          },
        },
        {
          cssClass: 'primary',
          text: '保存',
          handler: ($event: Event) => {

            const fileEditModalInstance =  results.modalContentInstance as FileEditModalComponent
            // todo 弹窗中填写的数据未做校验
            fileEditModalInstance.updateEditRecord().then(resp => {
              // 网络更新完数据之后 拿到的数据
              console.log(resp)
            })
          },
        },
      ],
    });
    const fileEditModalInstance = results.modalContentInstance as FileEditModalComponent;
    fileEditModalInstance.initData(data);
  }

  findFirstEmptyPropertyName(obj: Record<string, any>): string | null {
    const emptyProperty = Object.entries(obj).find(([key, value]) =>
      value === null ||
      value === undefined ||
      value === '' ||
      value === 0 ||
      Number.isNaN(value)
    );

    // 如果找到则返回属性名，否则返回 null
    return emptyProperty ? emptyProperty[0] : null;
  }

}
