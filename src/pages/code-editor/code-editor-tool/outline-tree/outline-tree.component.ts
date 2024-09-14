import {ChangeDetectorRef, Component} from '@angular/core';
import {MonacoService} from "../../../../services/monaco.service";
import {CodeEditorService} from "../../../../services/code-editor.service";
import {CommonModule} from "@angular/common";
import {NzFormatEmitEvent, NzTreeModule, NzTreeNode} from "ng-zorro-antd/tree";
import {NzContextMenuService, NzDropdownMenuComponent} from "ng-zorro-antd/dropdown";
import {NzMenuDirective, NzMenuItemComponent} from "ng-zorro-antd/menu";
import {NzIconDirective} from "ng-zorro-antd/icon";
interface Item {
  text?: string;
  title?: string;
  childItems?: Item[];
  children?: Item[];
  isLeaf?: boolean;
  [key: string]: any;
}
@Component({
  selector: 'app-outline-tree',
  standalone: true,
  imports: [NzTreeModule, CommonModule, NzDropdownMenuComponent, NzMenuItemComponent, NzMenuDirective, NzIconDirective],
  templateUrl: './outline-tree.component.html',
  styleUrl: './outline-tree.component.scss'
})
export class OutlineTreeComponent {
  outlineTree;

  // todo 切换标签页的时候 大纲变化 以及在编写代码的时候 动态的去调用
  constructor(private service: CodeEditorService, private nzContextMenuService: NzContextMenuService, private cdr: ChangeDetectorRef) {
    this.service.scriptChannel.subscribe(res => {
      if(res.type === "currentScript"){

        this.outlineTree = this.renameFields(res.scriptOutLine).children;
        console.log(this.outlineTree)
        this.cdr.markForCheck(); // 手动标记检查点
        // 或者使用 this.cdr.detectChanges(); 手动触发变更检测
      }
    });
  }

  // activated node
  activatedNode?: NzTreeNode;


  renameFields(obj: Item): Item {
    const newObj: Item = { ...obj };

    // 重命名 text 为 title
    if (newObj.text) {
      newObj.title = newObj.text;
      delete newObj.text;
    }

    // 重命名 childItems 为 children，并递归处理子项
    if (newObj.childItems) {
      newObj.isLeaf = false;
      newObj.children = newObj.childItems.map(res => this.renameFields(res)); // 递归调用
      delete newObj.childItems;
    }else {
      newObj.isLeaf = true;
    }
    return newObj;
  }


  // transformTree(tree: any, parentKey = '100', index = 0): any {
  //   const result = {
  //     title: tree.kind + ' ' + tree.text,
  //     key: parentKey,
  //     expanded: true,
  //     nameSpan: tree.nameSpan,
  //     children: []
  //   };
  //
  //   // 遍历每个子项
  //   if (tree.childItems && tree.childItems.length > 0) {
  //     tree.childItems.forEach((item: any, idx: number) => {
  //       // 如果子项有 childItems，则递归创建一个父节点，否则创建叶子节点
  //       if (item.childItems && item.childItems.length > 0) {
  //         result.children.push(this.transformTree(item, `${parentKey}${idx}`, idx));
  //       } else {
  //         result.children.push({
  //           title: tree.kind + ' ' + tree.text,
  //           key: `${parentKey}${idx}`,
  //           nameSpan: tree.nameSpan,
  //           isLeaf: true
  //         });
  //       }
  //     });
  //   }
  //
  //   // todo 点击对应位置 代码编辑器跳转到函数定义声明位置
  //   return result;
  // }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    // do something if u want
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  activeNode(data: NzFormatEmitEvent): void {
    // this.activatedNode = data.node!;
  }

}
