import {AfterViewInit, ChangeDetectorRef, Component, NgZone, ViewChild} from '@angular/core';
import {SplitAreaComponent, SplitComponent} from "angular-split";
import {ITool, tools} from "./tools.const";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {CodeEditorService} from "../../../../services/code-editor.service";
import {NzTreeViewModule} from "ng-zorro-antd/tree-view";
import {FileFolderComponent} from "./file-folder/file-folder.component";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzDrawerComponent} from "ng-zorro-antd/drawer";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {DialogService} from "ng-devui";
import {FileEditModalComponent} from "./file-edit-modal/file-edit-modal.component";

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
  ],
  templateUrl: './code-editor-tool.component.html',
  styleUrl: './code-editor-tool.component.scss'
})
export class CodeEditorToolComponent implements AfterViewInit{
  public addFileDrawerVisible: boolean = false;
  protected readonly tools = tools;
  showTool = false;
  @ViewChild( 'fileFolder' ) fileFolder: FileFolderComponent
  // 上一次选中的工具下标
  lastActiveToolIndex: number = 0

  constructor(
    public service: CodeEditorService,
    private cdr: ChangeDetectorRef,


  ) {
    this.service.windowChannel.subscribe( res => {
      if(res.name != "tool") return
      const index = this.tools.findIndex( item => item.isActive )
      if(index > -1) {
        this.lastActiveToolIndex = index
        this.tools.forEach( item => item.isActive = false )
        this.service.windowChannel.next( { name: 'toolWidth', value: 50 } )
      } else {
        console.log( this.lastActiveToolIndex )
        this.tools[this.lastActiveToolIndex].isActive = true
        this.service.windowChannel.next( { name: 'toolWidth', value: 330 } )
      }
    } );
    console.log(this.addFileDrawerVisible);
  }


  // beforeHidden(): Promise<boolean> {
  //   return new Promise((resolve) => {
  //     const results = this.dialogService.open({
  //       id: 'dialog-service',
  //       width: '300px',
  //       maxHeight: '600px',
  //       title: '',
  //       content: 'Do you want to save the modification before closing the page?',
  //       backdropCloseable: false,
  //       dialogtype: 'warning',
  //       buttons: [
  //         {
  //           cssClass: 'primary',
  //           text: 'Save',
  //           handler: ($event: Event) => {
  //             results.modalInstance.hide();
  //             resolve(true);
  //           },
  //         },
  //         {
  //           id: 'btn-cancel',
  //           cssClass: 'common',
  //           text: 'Cancel',
  //           handler: ($event: Event) => {
  //             results.modalInstance.hide();
  //             resolve(true);
  //           },
  //         },
  //       ],
  //     });
  //   });
  // }

  ngAfterViewInit() {
    this.changeToolStatus( this.tools[0], 0 )
  }

  changeToolStatus(tool: ITool, index: number) {
    tool.isActive = !tool.isActive
    this.showTool = this.tools.some( item => item.isActive )
    console.log(this.showTool)
    if(!tool.isActive) {
      const index = this.tools.findIndex( item => item.isActive )
      if(index > -1) return
      this.service.windowChannel.next( { name: 'toolWidth', value: 50 } )
    } else {
      this.lastActiveToolIndex = index
      this.service.windowChannel.next( { name: 'toolWidth', value: 330 } )
    }
  }

  // todo 实现对文件区的操作
  addFile() {
    console.log('add file')
    this.fileFolder.addNewFile();
  }

  editFile() {
    console.log('edit file')
    // this.fileArea.editFile()
  }

  removeFile() {
    console.log('remove file')
    // this.fileArea.removeFile()
  }

}
