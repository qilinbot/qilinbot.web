import { Injectable } from '@angular/core';
import {CodeEditorService} from "./code-editor.service";
import {MerkabaScript} from "../pages/code-editor/const/code-editor.page.const";
import {MonacoService} from "./monaco.service";

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  private breakPointsMap: Map<string, any[]> = new Map<string, any[]>(); // 记录每个脚本的断点

  constructor(private monacoService: MonacoService) {}

  // 初始化断点
  initBreakPoints(script: MerkabaScript) {
    this.breakPointsMap.set(script.id, script.breakPoints);
    this.updateEditorBreakPoints(script);
  }

  // 更新编辑器的断点
  updateEditorBreakPoints(script: MerkabaScript) {
    const editor = this.monacoService.editorMap.get(script.id);
    if (editor) {
      editor.deltaDecorations([], script.breakPoints);
    }
  }

  // 添加或删除断点
  toggleBreakPoint(script: MerkabaScript, lineNumber: number) {
    const breakPoints = this.breakPointsMap.get(script.id) || [];
    const existingIndex = breakPoints.findIndex(bp => bp.line === lineNumber);

    if (existingIndex !== -1) {
      breakPoints.splice(existingIndex, 1);
    } else {
      breakPoints.push({
        range: new this.monacoService.monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'debug-line',
          glyphMarginClassName: 'debug'
        },
        line: lineNumber
      });
    }

    script.breakPoints = breakPoints;
    this.updateEditorBreakPoints(script);
  }

  // 跳转到下一个断点
  stepOver(script: MerkabaScript) {
    this.changeBreakPoint(script, 1);
  }

  // 跳转到上一个断点
  stepBack(script: MerkabaScript) {
    this.changeBreakPoint(script, -1);
  }

  // 跳转到指定的断点
  private changeBreakPoint(script: MerkabaScript, change: number) {
    const editor = this.monacoService.editorMap.get(script.id);
    if (editor) {
      const range = new this.monacoService.monaco.Range(1, 1000, 1, 1000);
      const decorations = editor.getDecorationsInRange(range);
      const currentBreakPoints = decorations.filter(item => item.options.className === 'debug-current-line');
      const currentLine = currentBreakPoints[0]?.range.endLineNumber || 0;

      let newLine = currentLine + change;
      const validBreakPoints = script.breakPoints.filter(bp => bp.options.className === 'debug-line');
      const nextBreakPoint = validBreakPoints.find(bp => bp.line === newLine) || validBreakPoints[0];

      if (nextBreakPoint) {
        script.breakPoints = script.breakPoints.filter(bp => bp.line !== currentLine);
        script.breakPoints.push({
          range: new this.monacoService.monaco.Range(nextBreakPoint.line, 1, nextBreakPoint.line, 1),
          options: {
            isWholeLine: true,
            className: 'debug-current-line'
          },
          line: nextBreakPoint.line
        });
        this.updateEditorBreakPoints(script);
        editor.revealRangeInCenterIfOutsideViewport(nextBreakPoint.range);
      }
    }
  }
}
