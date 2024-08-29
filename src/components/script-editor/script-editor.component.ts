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
    console.log(1111);
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

    // this.editor.onKeyDown((e) => {
    //   if (e.keyCode === monaco.KeyCode.Enter) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     console.log('Enter key pressed');
    //     this.insertImage('11', '//p5.img.cctvpic.com/photoworkspace/contentimg/2023/03/30/2023033011303020756.jpg');
    //   }
    // });

    // 监听粘贴事件
    // this.editor.onDidPaste((event:IPasteEvent) => {
    //   const clipboardData = event.clipboardEvent!.clipboardData;
    //   // const clipboardData = event.clipboardEvent!.clipboardData || window.clipboardData;
    //   if (clipboardData) {
    //     const items: DataTransferItemList = clipboardData.items;
    //
    //     for(let i = 0;i < items.length; i++){
    //       if(items[i].type.startsWith('image/')){
    //         const file  = items[i].getAsFile();
    //         if(file){
    //           console.log('file');
    //           this.handleImagePaste(file);
    //         }
    //       }
    //     }
    //   }
    // });
  }


  // handleImagePaste(file: File) {
  //   const reader = new FileReader();
  //   reader.onload = (event) => {
  //     // 应该有图片的信息
  //     console.log(event);
  //     const base64Image = event.target!.result;
  //     this.insertImage(base64Image as string);
  //   };
  //   reader.readAsDataURL(file);
  // }

  insertImage(base64Image: string, imageUrl: string) {
    const position = this.editor.getPosition();

    // 生成唯一的ID
    const id = 'image-' + Date.now();
    const placeholder = {
      id: id,
      imageUrl: imageUrl,
      inlineClassName: 'image-placeholder-' + id,
      widgetClassName: 'image-widget-' + id
    };

    // 插入占位符字符 (使用一个特殊字符来占位，比如零宽度空格)
    this.editor.executeEdits(null, [{
      range: new monaco.Range(position!.lineNumber, position!.column, position!.lineNumber, position!.column),
      text: '\u200B',  // 零宽度空格字符
      forceMoveMarkers: true
    }]);

    // 添加装饰器以渲染图片
    const decorationIds = this.editor.deltaDecorations([], [{
      range: new monaco.Range(position!.lineNumber, position!.column, position!.lineNumber, position!.column + 1),
      options: {
        inlineClassName: placeholder.inlineClassName,
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    }]);

    // 将CSS样式添加到文档头部
    const style = document.createElement('style');
    style.textContent = `
        .${placeholder.inlineClassName} {
            background: url(${imageUrl}) no-repeat center center;
            background-size: cover;
            width: 30px; /* 图片宽度，可以根据需求调整 */
            height: 30px; /* 图片高度，可以根据需求调整 */
            display: inline-block;
            vertical-align: middle;
        }
        .monaco-editor .${placeholder.widgetClassName} {
            display: inline-block;
            width: 30px;
            height: 30px;
        }
    `;
    document.head.appendChild(style);

    // 移动光标到图片后
    this.editor.setPosition({
      lineNumber: position!.lineNumber,
      column: position!.column + 1 // +1 因为插入了零宽度空格字符和图片
    });

    // 监听光标位置改变以处理图片选中状态和删除
    this.editor.onDidChangeCursorPosition((e) => {
      const currentPosition = this.editor.getPosition();
      const decorations = this.editor.getModel()?.getDecorationsInRange(new monaco.Range(
        currentPosition!.lineNumber,
        currentPosition!.column - 1,
        currentPosition!.lineNumber,
        currentPosition!.column
      ));

      if (decorations && decorations.length > 0) {
        const decoration = decorations[0];
        if (decoration.options.inlineClassName === placeholder.inlineClassName) {
          // 添加选中样式
          this.editor.deltaDecorations([decoration.id], [{
            range: decoration.range,
            options: {
              inlineClassName: `${placeholder.inlineClassName} selected`,
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
            }
          }]);
        }
      }
    });

    // 监听键盘事件处理删除
    this.editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Backspace || e.keyCode === monaco.KeyCode.Delete) {
        const currentPosition = this.editor.getPosition();
        // 获取当前的装饰器
        const decorations = this.editor.getModel()?.getDecorationsInRange(new monaco.Range(
          currentPosition!.lineNumber,
          currentPosition!.column - 1,
          currentPosition!.lineNumber,
          currentPosition!.column
        ));

        if (decorations && decorations.length > 0) {
          const decoration = decorations[0];
          if (decoration.options.inlineClassName === placeholder.inlineClassName ||
            decoration.options.inlineClassName === `${placeholder.inlineClassName} selected`) {
            this.editor.deltaDecorations([decoration.id], []); // 删除装饰器
            this.editor.executeEdits(null, [{
              range: new monaco.Range(
                currentPosition!.lineNumber,
                currentPosition!.column - 1,
                currentPosition!.lineNumber,
                currentPosition!.column
              ),
              text: '',
              forceMoveMarkers: true
            }]);
          }
        }
      }
    });
  }


  // addImageDecoration(lineNumber: number, base64Image: string) {
  //   // Define the range for the decoration
  //   const range = new monaco.Range(lineNumber, 1, lineNumber, 1);
  //
  //   // Generate a unique class name for the decoration
  //   const className = `myInlineImage-${lineNumber}`;
  //
  //   // Create and apply the decoration
  //   const decoration: IModelDeltaDecoration = {
  //     range: range,
  //     options: {
  //       inlineClassName: className,
  //       hoverMessage: { value: 'This is an inline image!' },
  //     }
  //   };
  //   this.editor.deltaDecorations([], [decoration]);
  //
  //   // Create a new style element if not already created
  //   if (!document.getElementById(className)) {
  //     const styleElement = document.createElement('style');
  //     styleElement.id = className;
  //     styleElement.type = 'text/css';
  //     styleElement.textContent = `
  //       .${className} {
  //         background-image: url(${base64Image});
  //         background-size: cover;
  //         background-repeat: no-repeat;
  //         display: inline-block;
  //       }
  //     `;
  //     document.head.appendChild(styleElement);
  //   }
  // }

  /**
   * 获取大纲结构
   * @param model
   */
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

  /**
   * 处理鼠标点击事件
   * @param e
   */
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

  /**
   * 添加断点
   * @param lineNumber
   */
  addBreakpoint(lineNumber: number) {
    const breakPointDec:IModelDeltaDecoration = this.createBreakpointDecoration(lineNumber);
    this.breakpoints.add(lineNumber);
    let decorationIds = this.editor.deltaDecorations(this.decorationIds, [breakPointDec]);

    // 存储
    this.decorationMap.set(lineNumber, decorationIds);
  }

  /**
   * 移除断点
   * @param lineNumber
   */
  removeBreakpoint(lineNumber: number) {
    this.breakpoints.delete(lineNumber);
    const decorationId = this.decorationMap.get(lineNumber);
    if(decorationId){
      this.editor.deltaDecorations(decorationId, []);
    }
  }

  /**
   * 创建断点装饰
   * @param lineNumber
   */
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


