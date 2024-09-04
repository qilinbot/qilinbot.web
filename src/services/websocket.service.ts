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
    // 在service注入的时候初始化
    this.ws = new SocketClient(this.ctx.env.websocketHost, this.ctx.env.cookieId);
    this.ws.connect();
    this.ws.onOpen(res => {
      this.ws.send({
        action: 'auth',
        header:{},
        body:{}
      }).subscribe();
      console.log("send auth socket");
    });

    console.log("websocket service init");
  }


  send(message){
    return this.ws.send(message);
  }
  close(){
    this.ws.close();
  }


  onMessage(callback){
    return this.ws.onMessage(callback);
  }
}
