import { Component} from '@angular/core';
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";


import {
  NzTreeFlatDataSource,
  NzTreeFlattener,
  NzTreeNodeComponent,
  NzTreeNodeDefDirective,
  NzTreeNodeNoopToggleDirective,
  NzTreeNodeOptionComponent,
  NzTreeNodePaddingDirective,
  NzTreeNodeToggleRotateIconDirective,
  NzTreeViewComponent, NzTreeViewModule,
} from "ng-zorro-antd/tree-view";
import { FlatTreeControl } from '@angular/cdk/tree';
import {NzHighlightPipe} from "ng-zorro-antd/core/highlight";
import {FormsModule} from "@angular/forms";
import {NzNoAnimationDirective} from "ng-zorro-antd/core/no-animation";
import {CommonModule} from "@angular/common";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {SelectionModel} from "@angular/cdk/collections";
import {CodeEditorService} from "../../../../../../services/code-editor.service";

interface FoodNode {
  name: string;
  disabled?: boolean;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Fruit',
    children: [{ name: 'Apple' }, { name: 'Banana', disabled: true }, { name: 'Fruit loops' }]
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{ name: 'Broccoli' }, { name: 'Brussels sprouts' }]
      },
      {
        name: 'Orange',
        children: [{ name: 'Pumpkins' }, { name: 'Carrots' }]
      }
    ]
  }
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  disabled: boolean;
}

@Component({
  selector: 'app-file-folder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTreeNodeOptionComponent,
    NzIconDirective,
    NzTreeNodeComponent,
    NzTreeViewComponent,
    NzTreeNodeToggleRotateIconDirective,
    NzTreeNodePaddingDirective,
    NzTreeNodeNoopToggleDirective,
    NzTreeNodeDefDirective,
    NzInputGroupComponent,
    NzInputDirective,
    NzTreeViewModule,
    NzHighlightPipe,
    NzNoAnimationDirective,
  ],
  templateUrl: './file-folder.component.html',
  styleUrl: './file-folder.component.scss',
})
export class FileFolderComponent {
  private transformer = (node: FoodNode, level: number): ExampleFlatNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level,
    disabled: !!node.disabled
  });
  selectListSelection = new SelectionModel<ExampleFlatNode>();

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new NzTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private service: CodeEditorService) {
    this.service.load({}).subscribe(resp => {
      this.dataSource.setData(resp.items);
    })
    // this.dataSource.setData(TREE_DATA);
  }

  hasChild = (_: number, node: ExampleFlatNode): boolean => node.expandable;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.treeControl.expand(this.getNode('Vegetables')!);
    }, 300);
  }

  getNode(name: string): ExampleFlatNode | null {
    return this.treeControl.dataNodes.find(n => n.name === name) || null;
  }

}
