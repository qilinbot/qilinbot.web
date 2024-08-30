import {AfterViewInit, Component} from '@angular/core';
import {TabsModule} from "ng-devui";
import {CommonModule, NgClass, NgForOf, NgStyle} from "@angular/common";
import {NzTabComponent, NzTabSetComponent} from "ng-zorro-antd/tabs";
import {CodeEditorService} from "../../../services/code-editor.service";
import {MonacoService} from "../../../services/monaco.service";
import {MerkabaNode, MerkabaScript} from "../const/code-editor.page.const";
import {NzSwitchComponent} from "ng-zorro-antd/switch";
import {FormsModule} from "@angular/forms";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {NzCascaderComponent, NzCascaderOption} from "ng-zorro-antd/cascader";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {RenderService} from "../../../core/render.service";

// 样式重新写 添加日志组件

@Component({
  selector: 'app-code-editor-body',
  standalone: true,
  imports: [
    TabsModule,
    NgForOf,
    NzTabSetComponent,
    NzTabComponent,
    NgStyle,
    NgClass,
    CommonModule,
    NzSwitchComponent,
    FormsModule,
    NzButtonComponent,
    NzTooltipDirective,
    NzCascaderComponent,
    NzSelectComponent,
    NzOptionComponent,
  ],
  templateUrl: './code-editor-body.component.html',
  styleUrl: './code-editor-body.component.scss'
})
export class CodeEditorBodyComponent implements AfterViewInit{
  // 当前以及加载的脚本列表
  scripts: Array<MerkabaScript> = [];
  // tab
  scriptTabs  = [];
  // tab维护的下标
  currentScriptIndex = 0;

  // 当前编辑器选中准备运行的代码
  prepareRunScriptId: string;

  // 是否开启vnc
  enabledVNC: boolean = false

  // 当前选中的服务器节点
  selectedNode: Array<string> = [];

  // 脚本结点的维护 区段 - 区段可选结点
  groupMap:Map<string, Array<MerkabaNode>> = new Map<string, Array<MerkabaNode>>()
  // 结点分组  Nz组件使用的结构
  nodeGroup: Array<NzCascaderOption> = []

  // 当前正在运行的脚本实例
  runningScriptInstance = {
    jobId: '',
    deviceId: '',
  }

  get currentScript() {
    return this.scripts[this.currentScriptIndex]
  }


  constructor(public service: CodeEditorService, public monacoService: MonacoService, private render: RenderService) {
    this.service.scriptChannel.subscribe(e => {
      console.log(e);
      switch (e.type){
        case "openScript":
          if(e.script.type !== 2) return;
          this.openScriptEditor(e.script);
          break;
      }
    })
  }

  ngAfterViewInit(){
    this.refreshNodes();
  }

  /**
   * 打开脚本编辑器
   * @param data
   */
  openScriptEditor(data: MerkabaScript): void {
    if(!data.id) return;
    console.log(data);
    this.prepareRunScriptId = data.id;
    this.service.readScript(data.id).subscribe(resp => {
      let script: MerkabaScript = resp as MerkabaScript;
      script.changed = false;
      script.name = data.name;
      script.vncEnabled = script.vncEnabled || false;
      let index = this.scriptTabs.findIndex(item => item.id === data.id);
      if(index < 0){
        this.scriptTabs.push({id: script.id, name: script.name});
        index = this.scripts.push(script) - 1;
      }
      this.currentScriptIndex = index;
      if (document.querySelector(`.editor-${script.id} .monaco-editor`)) {
        this.updateInfoOfScript(script)
        return;
      }
      setTimeout( async () => {
        let element: any = document.querySelector(`.editor-${script.id}`);
        this.monacoService.createEditor(script, element, data.content);
        this.updateInfoOfScript(script)
      }, 150)
    })
  }

  /**
   * 更新脚本的信息
   * @param script
   */
  async updateInfoOfScript(script: MerkabaScript) {
    if(!this.currentScript) return;
    let scriptOutLine = await this.monacoService.getCurrentScriptMenuById(this.currentScript.id);
    this.service.scriptChannel.next({ type: 'currentScript', script: script || this.currentScript, scriptOutLine })
  }

  updateModule(script: MerkabaScript) {
    this.monacoService.editorMap
  }

  closeTab({ index }: { index: number }): void {
    this.scriptTabs.splice(index, 1);
  }

  newTab(): void {
    // this.tabs.push('New Tab');
    // this.selectedIndex = this.tabs.length;
  }


  /**
   * 刷新脚本获取的节点
   */
  refreshNodes(){
    this.service.loadNodes({}).subscribe(resp => {

      let merkabaNodes = (resp.items as MerkabaNode[]).filter(i => i.state !== 5);
      merkabaNodes.sort((a, b) => a.id.localeCompare(b.id)); // 按IP排序

      // 将数据格式转成NzCascaderOption结构
      merkabaNodes.forEach((node: MerkabaNode) => {
        let groupName = node.id.split('.')[0];   // 取IP的第一位
        let group = this.groupMap.get(groupName);
        (node as any).label = node.id;
        (node as any).value = node.id;
        (node as any).isLeaf = true;
        if(group?.length){
          group.push(node);
        }else {
          this.groupMap.set(groupName, [node]);
        }
        this.nodeGroup = [];
        this.groupMap.forEach( (value, key) => {
          this.nodeGroup.push({
            label: key,
            selectable: false,
            value: key,
            expanded: false,
            children: value as any
          })
        })
      })
    })
  }

  /**
   * 选择节点的时候 打印选中的节点
   * @param e
   */
  onNodeChanged(e){
    console.log(e);
  }
  /**
   * VNC的切换
   */
  changeEnabledVNC(){
    console.log(this.enabledVNC, "changeEnabledVNC")
  }

  /**
   * 运行脚本
   */
  runScript(){
    if(this.currentScriptIndex < 0) return;
    const currentScript = this.scripts.find(item => item.id === this.prepareRunScriptId);
    if(currentScript.changed){
      this.render.error("请先保存代码！");
    }

    if(!this.selectedNode[1]){
      this.render.error("请先选择节点！");
      return;
    }
    // todo 运行和暂停不能同时出现 因此不会出现这个问题
    if(this.currentScript.run) return ;
    currentScript.run = true;
    let runNodeId = this.selectedNode[1];
    // 发送运行脚本的状态
    this.service.scriptChannel.next({type: 'runScript', script: currentScript});

    this.service.runScript(currentScript, runNodeId, () => currentScript.run = false).subscribe(
      resp => {
      this.runningScriptInstance.jobId = resp.jobId;
      this.runningScriptInstance.deviceId = this.selectedNode[1];
      // vnc 的操作

      currentScript.run = false;
      this.service.windowChannel.next({name: 'log', open: true});
    },
        error => {currentScript.run = false}
    )
  }

  /**
   * 停止脚本
   */
  stopScript(){
    if(!this.selectedNode[1]) {
      this.render.error('没有选择节点')
      return
    }
    const currentScript = this.scripts.find(item => item.id == this.prepareRunScriptId)
    if(!this.runningScriptInstance.jobId && !currentScript.uri) {
      console.log(currentScript)
      this.render.error('没有正在运行的脚本')
      return
    }

    this.service.stopScript(
      this.runningScriptInstance.deviceId || this.selectedNode[1],
      this.runningScriptInstance.jobId || currentScript.uri
    ).subscribe(resp => {
      // this.currentTaskName = '';
      this.currentScript.run = false
    });
  }

  ngOnDestroy(){
    this.scripts.forEach(script => {
      this.monacoService.removeEditor(script.id);
    })
  }
}
