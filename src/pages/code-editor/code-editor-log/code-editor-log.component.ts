import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {VirtualScrollerComponent} from "../../../components/virtual-scroller/virtual-scroller.component";
import {NgxJsonViewerModule} from "ngx-json-viewer";
import {CommonModule} from "@angular/common";
import {CodeEditorService} from "../../../services/code-editor.service";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {SocketClient} from "../../../core/net/socketclient";
import {ContextService} from "../../../core/context.service";
import {WebsocketService} from "../../../services/websocket.service";
import {MerkabaScript} from "../const/code-editor.page.const";

@Component({
  selector: 'app-code-editor-log',
  standalone: true,
  imports: [
    VirtualScrollerComponent,
    NgxJsonViewerModule,
    CommonModule,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
  ],
  templateUrl: './code-editor-log.component.html',
  styleUrl: './code-editor-log.component.scss'
})
export class CodeEditorLogComponent {
  // @ViewChild('scrollLogs', {static: false}) scrollLogs: VirtualScrollerComponent;
  // 用于记录所有连接所创建的实例
  protected busInstances: Map<string, {infos: Array<any>, instance?: any}> = new Map();

  items = [];
  ws: SocketClient;
  // 当前运行的脚本url
  currentId: string = ''
  constructor(private service: CodeEditorService, private ctx: ContextService, private wsService: WebsocketService,) {
    console.log(document.cookie);
    this.service.scriptChannel.subscribe((resp) => {
      switch (resp.type){
        case 'runScript':
          // todo 建立websocket连接 获取运行的信息
          this.updateBusSub(resp.script);
          break;
        case 'closeScript':
          // todo 关闭websocket连接 怎么会有终止运行呢
          break;
      }
    })
    // 订阅日志窗口的显隐

  }

  /**
   * 遵循channel  instance  uri 的规则 去建立websocket连接
   *
   * @param script
   */
  updateBusSub(script: MerkabaScript){
    if(!script.uri) return;
    this.wsService.send({
      action: 'subscribe',
      header: {
        channel: 'merkaba',
        topic: 'script',
        instance: script.uri,
      }
    }).subscribe();

    this.wsService.onMessage(res => {
      res = JSON.parse(res.data);
      console.log(res);
      let item = res.body.level + ' ' + res.body.message;
      this.items = [...this.items, item]
    })
  }

  cancelSub(){
    this.ws.close();
  }

  // 需要维护所有的订阅 所有的websocket
  cancelAllInstance(){
    this.ws.close();
  }

  test(){
    this.ws.sendMessage('1').subscribe();
  }

  onSearch(term){
    console.log(term);
  }

  // scrollInto(info) {
  //   this.scrollLogs.scrollInto(info);
  // }
  //
  // scrollIntoIndex(index: number) {
  //   this.scrollLogs.scrollToIndex(index);
  // }
}
