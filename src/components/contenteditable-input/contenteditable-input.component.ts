import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgIf, NgStyle} from "@angular/common";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@Component({
  selector: 'app-contenteditable-input',
  standalone: true,
  imports: [
    NgStyle,
    NgIf,
    NzTooltipDirective
  ],
  templateUrl: './contenteditable-input.component.html',
  styleUrl: './contenteditable-input.component.scss'
})
export class ContenteditableInputComponent implements AfterViewInit{
  isEdit: boolean = false;
  text: string = "新建";

  @Input() order: number;
  @Output() destory = new EventEmitter();
  @Output() valueChange = new EventEmitter();

  boxInfo = {
    width: 384,
    height: 36,
  };

  @ViewChild('textBox') textBox!: ElementRef;
  get boxStyle() {
    return {
      width: this.boxInfo.width + 'px',
      height: this.boxInfo.height + 'px',
    };
  }

  ngAfterViewInit(){
    this.editText();
  }

  editText() {
    this.isEdit = true;

    setTimeout(() => {
      const textbox = document.getElementById('textbox');
      if (window.getSelection && textbox) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(textbox);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      // textbox?.addEventListener('paste', (e: ClipboardEvent) => {
      //   e.preventDefault();
      //   e.stopPropagation();
      //
      //   let text = '';
      //   const clipboardData = e.clipboardData || window['clipboardData'];
      //   if (clipboardData) {
      //     text = clipboardData.getData('text/plain') || '';
      //     if (text) {
      //       document.execCommand('insertText', false, text);
      //     }
      //   }
      // });
      //   监听回车事件

      textbox.addEventListener('blur', () => {
        this.updateText();
        this.valueChange.next(this.text);
      })
      textbox?.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.updateText();
          // 当按下回车的时候 返回数据
          this.valueChange.next(this.text);
        }
      });
    }, 100);
  }

  updateText(){
    let modifiedText = this.textBox.nativeElement.innerHTML
      .replace(/<div><br><\/div>/g, '\n')  // 替换 <div><br></div> 为换行
      .replace(/<div.*?>/g, '\n')          // 替换所有 <div> 为换行
      .replace(/<br.*?>/g, '')             // 移除所有 <br> 标签
      .replace(/<\/div>|&nbsp;|<\/?span.*?>/g, '') // 移除 </div>, &nbsp; 和 <span> 标签
      .trim();  // 去除前后的空格和多余换行

    this.isEdit = false;

    // 只有当文字内容有实际变化时才更新
    if (this.text !== modifiedText) {
      this.text = modifiedText || '双击编辑文字';
      this.updateBoxSize();
    }
  }

  updateBoxSize() {
    const textbox = document.getElementById('textbox');
    if (textbox) {
      this.boxInfo.height = textbox.offsetHeight;
    }
  }

  delete(){
    this.destory.emit(this.order);
  }
}
