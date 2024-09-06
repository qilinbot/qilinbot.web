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
import {DialogService} from "ng-devui";
import {FileEditModalComponent} from "../file-edit-modal/file-edit-modal.component";
import {RenderService} from "../../../../core/render.service";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {MonacoService} from "../../../../services/monaco.service";
import {FocusKeyManager} from "@angular/cdk/a11y";

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
  ],
  templateUrl: './file-folder.component.html',
  styleUrl: './file-folder.component.scss',
})
export class FileFolderComponent {
  iconType = EIconType;
  private fileData: MerkabaRecord[] = [];
  @ViewChild("treeView", {static: false}) treeView!: NzTreeViewComponent<FlatNode>;
  // 扁平化
  private transformer = (node: MerkabaRecord, level: number): FlatNode => ({
    ...node,
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    parentRecord: node.parentRecord,
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
  constructor(private service: CodeEditorService, private dialogService: DialogService, private render: RenderService, private monaco: MonacoService) {
    this.service.load({}).subscribe(resp => {
      // todo 初始化monaco的所有模块 改成按需加载
      this.monaco.initModels(resp.items).then(r => this.monaco.scriptInitLoaded.next(true));
      this.fileData = resp.items;
      this.dataSource.setData(resp.items);
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
   * 新建文件
   */
  addNewFile() {
    const parseParentId = (node: FlatNode) => {
      if (!node) return "";
      else {
        switch (node.type) {
          case 0:
          case 1:
            return node.id
          default:
            return node.parentId || node.id;
        }
      }
    }
    const getRecord = (node: FlatNode): MerkabaRecord => {
      if (node) {
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

  /**
   * 选中文件夹的内容删除文件
   */
  removeFile() {
    const deleteRecord = this.selectListSelection.selected[0];
    if (!deleteRecord) {
      return; // 没有选择
    }

    let result = this.render.confirm('确定要删除{' + deleteRecord.name + '}吗？');
    if (result) {
      this.service.remove(deleteRecord.id).subscribe(resp => {
        this.removeNodeRecursively(this.fileData, deleteRecord.id);
        this.dataSource.setData(this.fileData); // 更新视图
      });
    }
  }
  private removeNodeRecursively(nodes: MerkabaRecord[], nodeId: string): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === nodeId) {
        nodes.splice(i, 1);
        return true;
      }
      if (nodes[i].children && this.removeNodeRecursively(nodes[i].children, nodeId)) {
        return true;
      }
    }
    return false;
  }


  /**
   * 修改文件的基本信息
   */
  editFile() {
    let editRecord = this.selectListSelection.selected[0];

    if (editRecord.parentId) {
      editRecord.parentRecord = this.selectListSelection.selected[0].parentRecord;
    }
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


  /**
   * 弹窗新建/修改文件信息
   * @param data
   * @param isEdit
   * @param type
   */
  updateFile(data: MerkabaRecord, isEdit: boolean = false, type: 'add' | 'modify') {
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
            // todo handler 要根据传入的是编辑还是增加去分别操作 有修改操作再补
            const fileEditModalInstance = results.modalContentInstance as FileEditModalComponent
            fileEditModalInstance.updateEditRecord().then(resp => {
              if(resp.isSuccess){
                delete resp.isSuccess;
                Object.assign(data, resp);
                if (data.parentRecord) {
                  data.parentRecord.children.push(data);
                } else {
                  this.fileData.push(data);
                }
                console.log(data)
                this.dataSource.setData(this.fileData);
                results.modalInstance.hide();
              }
            })
          },
        },
      ],
    });
    const fileEditModalInstance = results.modalContentInstance as FileEditModalComponent;
    fileEditModalInstance.initData(data);
  }

}
