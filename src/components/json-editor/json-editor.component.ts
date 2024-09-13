import { Component, ElementRef, Input, ViewChild, ViewEncapsulation, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import JSONEditor from 'jsoneditor';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  encapsulation: ViewEncapsulation.None, // 允许外部样式影响
  template: `
    <div class="json-editor" #jsonEditorContainer style="height: 400px; width: 100%;"></div>
  `,
  styleUrls: ['./json-editor.component.scss']
})
export class JsonEditorComponent implements OnChanges {
  @ViewChild('jsonEditorContainer', { static: true }) jsonEditorContainer: ElementRef;
  @Input() width: string;
  @Input() height: string;
  @Input() mode: 'code' | 'view';  // 接受传入的模式
  @Input() json: string;  // 接受传入的 JSON 数据
  @Output() jsonChange = new EventEmitter<string>();  // 发射 JSON 数据变化

  jsonEditor: JSONEditor;

  ngAfterViewInit() {
    this.initEditor();
  }

  ngOnChanges(changes: SimpleChanges) {
    // 当输入的 mode 或 json 发生变化时重新初始化编辑器
    if (changes['mode'] ) {
      this.initEditor();
    }else if(changes['json']){
      this.jsonEditor.set(JSON.parse(this.json));
    }
  }

  // 编辑完之后
  initEditor() {
    if (this.jsonEditor) {
      this.jsonEditor.destroy();
    }

    // 初始化 JSON Editor
    this.jsonEditor = new JSONEditor(this.jsonEditorContainer.nativeElement, {
      mode: this.mode || 'code',  // 使用传入的 mode，默认为 'view'
      onChange: () => this.onEditorChange()  // 监听编辑器内容变化
    });

    // 设置 JSON 数据
    if (this.json) {
      this.jsonEditor.set(JSON.parse(this.json));
    }
  }

  onEditorChange() {
    const updatedJson = this.jsonEditor.get();  // 获取编辑器内容
    this.jsonChange.emit(JSON.stringify(updatedJson));  // 发射更新后的 JSON
    // try {
    //   // 做到
    //
    // } catch (error) {
    //   console.error("Invalid JSON", error);  // 捕获错误
    // }
  }
}
