import { Component } from '@angular/core';
import {NzTabComponent, NzTabSetComponent} from "ng-zorro-antd/tabs";

@Component({
  selector: 'app-code-editor-body',
  standalone: true,
  imports: [
    NzTabSetComponent,
    NzTabComponent
  ],
  templateUrl: './code-editor-body.component.html',
  styleUrl: './code-editor-body.component.scss'
})
export class CodeEditorBodyComponent {
  tabs = ['Tab 1', 'Tab 2'];
  selectedIndex = 0;

  closeTab({ index }: { index: number }): void {
    this.tabs.splice(index, 1);
  }

  newTab(): void {
    this.tabs.push('New Tab');
    this.selectedIndex = this.tabs.length - 1;
  }
}
