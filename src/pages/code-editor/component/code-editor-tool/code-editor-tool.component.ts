import {AfterViewInit, ChangeDetectorRef, Component, NgZone} from '@angular/core';
import {SplitAreaComponent, SplitComponent} from "angular-split";
import {ITool, tools} from "./tools.const";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {CodeEditorService} from "../../../../services/code-editor.service";
import {NzTreeViewModule} from "ng-zorro-antd/tree-view";
import {FileFolderComponent} from "./component/file-folder/file-folder.component";

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
  ],
  templateUrl: './code-editor-tool.component.html',
  styleUrl: './code-editor-tool.component.scss'
})
export class CodeEditorToolComponent implements AfterViewInit{
  protected readonly tools = tools;
  showTool = false;
  // @ViewChild( 'fileArea' ) fileArea: FileAreaComponent
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
  }

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
    // this.fileArea.addFile()
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
