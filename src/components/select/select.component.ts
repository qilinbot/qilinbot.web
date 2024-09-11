import {Component, ElementRef, EventEmitter, HostListener, Input, Output, TemplateRef} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent {
  @Input() options: any[] = [];
  @Input() selectedOption: any;
  @Input() placeholder: string = 'Select an option';
  @Input() customOptionTemplate: TemplateRef<any>;
  @Input() customSelectedOptionTemplate: TemplateRef<any>;
  @Output() selectedOptionChange = new EventEmitter<any>();

  // 判断下拉框是否展开
  isDropdownOpen = false;
  constructor(private eRef: ElementRef) {
  }
  /**
   * 关闭下拉框
   */
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  /**
   * 选中选项
   * @param option
   * @param event
   */
  selectOption(option: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedOption = option;
    this.toggleDropdown()
    this.selectedOptionChange.emit(option);
    console.log(this.isDropdownOpen)
  }

  // 监听全局点击事件
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (this.isDropdownOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false; // 点击下拉框以外的区域时隐藏菜单
    }
  }
}
