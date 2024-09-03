import {Component, ViewChild} from '@angular/core';
import {SearchModule} from "ng-devui";
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
    SearchModule,
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
  @ViewChild('scrollLogs', {static: false}) scrollLogs: VirtualScrollerComponent;
  // 用于记录所有连接所创建的实例
  protected busInstances: Map<string, {infos: Array<any>, instance?: any}> = new Map();

  items = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'];
  ws: SocketClient;
  // 当前运行的脚本url
  currentId: string = ''
  constructor(private service: CodeEditorService, private ctx: ContextService, ) {
    console.log(document.cookie);
    this.service.scriptChannel.subscribe((resp) => {
      switch (resp.type){
        case 'runScript':
          // todo 建立websocket连接 获取运行的信息
          this.updateBusSub(resp.script);
          break;
        case 'closeScript':
          // todo 关闭websocket连接
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
    this.ws.connect();
    this.ws.onMessage(res => {
      console.log(res);
      this.scrollInto(res);
    })

    const data = {
      action: 'subscribe',
      header: {
        channel: 'merkaba',
        topic: 'script',
        instance: script.uri
      },
      body: {},
    }
    this.ws.send(data)
  }

  onSearch(term){
    console.log(term);
  }

  scrollInto(info) {
    this.scrollLogs.scrollInto(info);
  }

  scrollIntoIndex(index: number) {
    this.scrollLogs.scrollToIndex(index);
  }
}
