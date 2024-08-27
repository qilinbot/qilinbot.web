import { Component } from '@angular/core';
import {TabsModule} from "ng-devui";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-code-editor-body',
  standalone: true,
  imports: [
    TabsModule,
    NgForOf,
  ],
  templateUrl: './code-editor-body.component.html',
  styleUrl: './code-editor-body.component.scss'
})
export class CodeEditorBodyComponent {
  tabActiveId: string | number = 'tab1';
  wrappedActiveId: string | number = 'tab1';
  tabItems = [
    {
      id: 'tab1',
      title: 'Tab1',
      disabled: true,
      content: `Tab1 Content`,
    },
    {
      id: 'tab2',
      title: 'Tab2',
      content: `Tab2 Content`,
    },
    {
      id: 'tab3',
      title: 'Tab3',
      content: `Tab3 Content`,
    },
  ];
  wrappedItems = [];

  constructor() {
    this.wrappedItems = [...this.tabItems];
  }

  ngOnInit(): void {
    setTimeout(() => {
      // 直接变换标签页
      this.tabActiveId = 'tab2';
    }, 100);
  }

  handle({ id, operation }, type): void {
    const dataName = `${type}Items`;
    const activeId = `${type}ActiveId`;
    if (operation === 'add') {
      const data = this[dataName];
      for (let i = 1; i <= data.length + 1; i++) {
        if (!data.find((item) => item.id === `tab${i}`)) {
          const newId = `tab${i}`;
          this[dataName].push({
            id: newId,
            title: `Tab${i}`,
            content: `Tab${i} Content`,
          });
          if (type === 'wrapped') {
            this.wrappedActiveId = newId;
          }
          break;
        }
      }
    }
    if (operation === 'delete' && this[dataName]?.length > 1) {
      this[dataName] = this[dataName].filter((item) => item.id !== id);
      if (this[activeId] === id) {
        this[activeId] = this[dataName][0]?.id;
      }
    }
  }
}
