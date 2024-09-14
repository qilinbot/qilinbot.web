import {Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@Component({
  selector: 'app-edit-input',
  standalone: true,
  imports: [CommonModule, NzTooltipDirective],
  templateUrl: './edit-input.component.html',
  styleUrl: './edit-input.component.scss'
})
export class EditInputComponent {
  isEdit: boolean = false;
  text: string = '双击编辑文字';

  key: string = 'var';
  @Input() order: number;
  @Input() value: string;
  @Output() destory = new EventEmitter();

  // 组件中分为key value 编辑的时候只编辑key的值， 而无法修改value的值

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
      textbox?.addEventListener('paste', (e: ClipboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        let text = '';
        const clipboardData = e.clipboardData || window['clipboardData'];
        if (clipboardData) {
          text = clipboardData.getData('text/plain') || '';
          if (text) {
            document.execCommand('insertText', false, text);
          }
        }
      });
    //   监听回车事件
      textbox?.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.updateText();
        }
      });
    }, 100);
  }

  updateText() {
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
