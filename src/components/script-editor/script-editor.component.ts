import { AfterViewInit, Component } from '@angular/core';
import * as monaco from 'monaco-editor';
import {editor} from "monaco-editor";
import IModelDeltaDecoration = editor.IModelDeltaDecoration;
import IPasteEvent = editor.IPasteEvent;

@Component({
  selector: 'app-script-editor',
  standalone: true,
  imports: [],
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.scss']
})
export class ScriptEditorComponent implements AfterViewInit {
  editor: monaco.editor.IStandaloneCodeEditor;
  decorationIds: string[] = [];
  breakpoints: Set<number> = new Set<number>();
  decorationMap: Map<number, string[]> = new Map<number, string[]>();

  ngAfterViewInit() {
    const jsCode = `"use strict";
function Person(age) {
  if (age) {
    this.age = age;
  }
}
Person.prototype.getAge = function () {
  return this.age;
};
class Animal{
  a: string = '1';
  b: number = 2;

  add(a: string, b: string){
    return a + b;
  }

  copy(a: string, count: number){
    return a.repeat(count);
  }
}

const dog = new Animal();

const handle = document.getElementById('app');
handle.addEventListener('mousedown', (e) => onDragStart(e.clientX));

function onDragStart(e: any){
  const a: string  = '1';
  return a;
}
    `

    this.editor = monaco.editor.create(document.getElementById('container')!, {
      language: 'typescript',
      value: jsCode,
      theme: 'vs',
      fontSize: 16,
      lineHeight: 30,
    });

    // 监听鼠标点击事件
    this.editor.onMouseDown((e) => this.handleMouseDown(e));

    // 监听变化更新大纲
    this.editor.onDidChangeModelContent(() => {
      const model = this.editor.getModel();
      if(model){
        this.getOutline(model)
      }
    })

    // 监听粘贴事件
    this.editor.onDidPaste((event:IPasteEvent) => {
      const clipboardData = event.clipboardEvent!.clipboardData;
      // const clipboardData = event.clipboardEvent!.clipboardData || window.clipboardData;
      if (clipboardData) {
        const items: DataTransferItemList = clipboardData.items;

        for(let i = 0;i < items.length; i++){
          if(items[i].type.startsWith('image/')){
            const file  = items[i].getAsFile();
            if(file){
              this.handleImagePaste(file);
            }
          }
        }
      }
    });

  }


  handleImagePaste(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      // 应该有图片的信息
      console.log(event);
      const base64Image = event.target!.result;
      this.insertImage(base64Image as string);
    };
    reader.readAsDataURL(file);
  }

  insertImage(base64Image: string) {
    const position = this.editor.getPosition();
    const imageText = `![image](${base64Image})`;
    // this.editor.executeEdits('', [
    //   {
    //     range: new monaco.Range(position!.lineNumber, position!.column, position!.lineNumber, position!.column),
    //     text: imageText,
    //     forceMoveMarkers: true
    //   }
    // ]);

    this.addImageDecoration(position!.lineNumber, base64Image);
  }

  addImageDecoration(lineNumber: number, base64Image: string) {
    // Define the range for the decoration
    const range = new monaco.Range(lineNumber, 1, lineNumber, 1);

    // Generate a unique class name for the decoration
    const className = `myInlineImage-${lineNumber}`;

    // Create and apply the decoration
    const decoration: IModelDeltaDecoration = {
      range: range,
      options: {
        inlineClassName: className,
      }
    };
    this.editor.deltaDecorations([], [decoration]);

    // Create a new style element if not already created
    if (!document.getElementById(className)) {
      const styleElement = document.createElement('style');
      styleElement.id = className;
      styleElement.type = 'text/css';
      styleElement.textContent = `
        .${className} {
          background-image: url(${base64Image});
          background-size: cover;
          background-repeat: no-repeat;
          display: inline-block;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }


  getOutline(model: monaco.editor.ITextModel) {
    monaco.languages.typescript.getTypeScriptWorker().then(worker => {
      worker(model.uri).then((client: any) => {
        client.getNavigationTree(model.uri.toString()).then((tree: any) => {
          console.log(tree);  // 打印出当前文件的代码结构树
        });
      });
    }).catch(error => {
      console.error('Error getting TypeScript worker:', error);
    });
  }

  // 处理鼠标点击事件
  handleMouseDown(e: monaco.editor.IEditorMouseEvent) {
    const { type, position } = e.target;
    if (!this.isValidClickTarget(type, position)) return;

    const lineNumber = position!.lineNumber;
    if(this.breakpoints.has(lineNumber)){
      this.removeBreakpoint(lineNumber);
    }else {
      this.addBreakpoint(lineNumber);
    }
    console.log(this.breakpoints)
  }

  // 验证点击目标是否有效
  isValidClickTarget(type: monaco.editor.MouseTargetType, position: monaco.IPosition | null): boolean {
    return !!position &&
      [monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN, monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS].includes(type);
  }

  // 添加断点
  addBreakpoint(lineNumber: number) {
    const breakPointDec:IModelDeltaDecoration = this.createBreakpointDecoration(lineNumber);
    this.breakpoints.add(lineNumber);
    let decorationIds = this.editor.deltaDecorations(this.decorationIds, [breakPointDec]);

    // 存储
    this.decorationMap.set(lineNumber, decorationIds);
  }

  // 移除断点
  removeBreakpoint(lineNumber: number) {
    this.breakpoints.delete(lineNumber);
    const decorationId = this.decorationMap.get(lineNumber);
    if(decorationId){
      this.editor.deltaDecorations(decorationId, []);
    }
  }

  // 创建断点装饰
  createBreakpointDecoration(lineNumber: number): monaco.editor.IModelDeltaDecoration {
    return {
      range: new monaco.Range(lineNumber, 1, lineNumber, 1),
      options: {
        isWholeLine: true,
        className: "contentClass",
        marginClassName: "myGlyphMarginClass",
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
      },
    };
  }

  ngDestroy(){
    this.editor.dispose();
  }
}


