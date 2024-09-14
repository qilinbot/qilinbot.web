import {Component, ComponentRef, ViewChild, ViewContainerRef} from '@angular/core';
import {EditInputComponent} from "../../../../components/edit-input/edit-input.component";

@Component({
  selector: 'app-variable-watcher',
  standalone: true,
  imports: [],
  templateUrl: './variable-watcher.component.html',
  styleUrl: './variable-watcher.component.scss'
})
export class VariableWatcherComponent {
  @ViewChild('WatcherContainer', {read: ViewContainerRef}) container: ViewContainerRef;

  // todo 实现变量名 不可以重复

  // 当前有多少个 被监控的变量
  count = 0;
  varibleMap = new Map<number, ComponentRef<EditInputComponent>>()

  // 服务器获取的数据

  varibleList: Array<string> = [];
  constructor() {
  }

  createVarWatcher(){
    // 动态创建并插入组件
    let componentRef = this.container.createComponent(EditInputComponent);
    componentRef.instance.order = this.count;
    componentRef.instance.editText();
    this.varibleMap.set(this.count++, componentRef);

    componentRef.instance.destory.subscribe(res => {
      let com = this.varibleMap.get(res);
      com.destroy();
      this.varibleMap.delete(res);
    })
  }

  getVaribleKeys(){
    this.varibleMap.forEach((value, key) => {
      this.varibleList.push(value.instance.text);
    })

    console.log(this.varibleList);
  }

  /**
   * 设置变量的值
   */
  setVaribleValue(){
    this.varibleMap.forEach((value, key) =>
      value.instance.value = Math.random().toString())
  }
}
