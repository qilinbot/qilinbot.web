import {Inject, Injectable} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SocketClient, WebSocketSendMode } from "../core/net/socketclient";
import {MerkabaScript} from "../pages/code-editor/const/code-editor.page.const";
import {ContextService} from "../core/context.service";
import {AppContext} from "../core/const/context.var";

//
// const data = {
//   action: 'unsubscribe',
//   header: {
//     channel: 'merkaba',
//     topic: 'script',
//     instance: script.id
//   },
//   body: {},
// }
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws: SocketClient;
  constructor(@Inject(AppContext) public ctx: ContextService,) {
    console.log(this.ctx.env.websocketHost);
  }


  connect(url: string, cookieId: string, script: MerkabaScript, protocols?: Array<string>, config?: any, binaryType?: BinaryType, ) {
    this.ws = new SocketClient(this.ctx.env.websocketHost, cookieId, protocols, config, binaryType);
    this.ws.connect();
  }

  onMessage(callback: (message: MessageEvent) => void, options?: any) {
    this.ws.onMessage(callback, options);
  }

  send(data: any, binary?: boolean): Observable<any> {
    return this.ws.sendMessage(data, WebSocketSendMode.Observable, binary);
  }

  sendDirect(data: any, binary?: boolean): boolean {
    return this.ws.sendMessage(data, WebSocketSendMode.Direct, binary);
  }

  close(force: boolean = false, keepReconnectIfNotNormalClose?: boolean) {
    if (this.ws) {
      this.ws.close(force, keepReconnectIfNotNormalClose);
    }
  }

  onError(callback: (event: ErrorEvent) => void) {
    this.ws.onError(callback);
  }


}
