import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {MerkabaNode, MerkabaRecord, MerkabaScript} from "../pages/code-editor/const/code-editor.page.const";
import {HttpService} from "../core/http.service";
import {NzCascaderOption} from "ng-zorro-antd/cascader";


/**
 * 任务的参数 todo 可拓展
 */
interface IParameter{
  scriptUri:string,
  dataType:string,
  offset:number,
  days:number
}

/**
 * 定时任务
 */
interface IScheduleTask {
  id: string,
  type: string,
  account: string,
  version: number,
  clazz: string,
  parameters: Array<IParameter>,
  cronValue: string,
  cronType: string,
  memo: string
}

/**
 * merkaba任务
 */
interface IMerkabaTask{
  id:string,
  account:string,
  scriptId:string,
  scriptUri:string,
  memo:string
}

/**
 * 选中字体的高亮
 */
export interface IScriptOutLine {
  childItems?: Array<IScriptOutLine>,
  kind?: string,
  text?: string
}

/**
 * 脚本编辑器的事件
 * todo： 可能需要修改
 * needCurrentScript 获取当前脚本
 * showScriptParams  显示脚本参数
 * removeScript  移除脚本 todo
 * updateTree    更新大纲树 todo updateTreeData的区别
 * runScript     运行脚本
 * updateScript  更新脚本
 * currentScript   当前脚本 todo（具体含义是啥？？？）
 * openScript     打开脚本
 * updateTreeData   更新大纲树
 * closeScript 关闭当前脚本
 */
export interface IScriptEvent {
  type: 'needCurrentScript' | 'showScriptParams' | 'removeScript' | 'updateTree' | 'runScript'
    | 'updateScript' | 'currentScript' | 'openScript' | 'updateTreeData' | 'closeScript' | 'switchScript'
  script?: MerkabaScript
  scripts?: Array<MerkabaScript>
  scriptOutLine?: IScriptOutLine
  uri?: string
}

/**
 * 脚本窗口的事件
 * todo： 可能需要增加
 * log          打开日志窗口
 * codeHeight   修改代码窗口的高度
 * tool         修改工具栏的显示
 * toolWidth    修改的工具栏的宽度
 */
export interface IScriptWindowEvent {
  name: 'log' | 'codeHeight' | 'tool' | 'toolWidth',
  open?: boolean,
  value?: number,
}

/**
 * todo : 修改
 */
export interface IDeskLayoutObject{
  scriptId:string,
  windowName:string,
  shotUri:string,
  screen?:any,
  frames?:any,
  layout?: string,
}

/**
 * 运行结点的设备信息
 */
export interface MerkabaNodeData{
  deviceId: string,
  platform:string,
  // parameters:any,
  // tags: any,
  // idleCount:number,
  maxCount:number,
}

/**
 * todo 断点信息接口
 */
export interface BreakPoint{
  line:number,

}
@Injectable({
  providedIn: 'root'
})
export class CodeEditorService {
  // 代码的列表项目的获取 脚本相关的接口 调试 等等

  // 脚本事件的分发
  scriptChannel: Subject<IScriptEvent> = new Subject<IScriptEvent>()
  // 脚本窗口的事件分发
  windowChannel: Subject<IScriptWindowEvent> = new Subject<IScriptWindowEvent>()

  // 维护断点信息
  breakpoint: Array<BreakPoint> = [];

  constructor(private http: HttpService) {}

  /**
   * 合并当前uri和父记录的uri
   * @param name
   * @param parentRecordUri
   */
  assignUri(name: string, parentRecordUri:string) {
    let uris:Array<string> = [];
    uris.push( name  );
    if(parentRecordUri) {
      uris.unshift( parentRecordUri);
    }
    console.log(uris)
    return uris.join( '/' );
  }

  /**
   * 得到一个脚本的请求参数对象
   * @param script
   */
  public getScriptRequest(script: MerkabaScript, ) {
    return {
      'id': script.id,
      'name': script.name,
      'content': script.content,
      'parameters': typeof script.parameters == "string" ? script.parameters :JSON.stringify(script.parameters),
      'maxInstance': script.maxInstance,
      'maxWaitTime': script.maxWaitTime,
      'devVersion': script.version,
      headless: script.headless,
      releaesEnabled: script.releaesEnabled,
      proxy: script.proxy,
      // 'vncEnabled': script.vncEnabled,
      'requireLogin': script.requireLogin|| false,
      'loginAccount': script.loginAccount|| '',
      'loginScriptId': script.loginScriptId || '',
      'loginScriptUri': script.loginScriptUri|| '',
      'loginTimeout': script.loginTimeout || 1,
      'loginSiteUrl': script.loginSiteUrl || 1
    }
  }

  public load(options: any) {
    return this.http.post('/Merkaba/load', options);
  }

  public readObject(id: string) {
    return this.http.post('/Merkaba/readObject', {id});
  }

  public readScript(id: string) {
    return this.http.post('/Merkaba/readScriptForIDE', {id});
  }

  public updateScript(param: MerkabaScript) {
    let value = this.getScriptRequest(param);
    return this.http.post('/Merkaba/updateScript', value);
  }

  /**
   * todo
   * @param param 键值对集合
   */
  public updateScripts(param) {
    // param = this.getScriptRequest(param);
    return this.http.post('/Merkaba/updateScripts', param);
  }

  public updateRecord(param: MerkabaRecord) {
    return this.http.post('/Merkaba/updateBaseInfo', param);
  }

  /*batch update*/
  public dragDrop(param) {
    return this.http.post('/Merkaba/dragDrop', param);
  }


  public add(id: string, name: string, version: string) {
    return this.http.post('/Merkaba/update', {id, name, version});
  }

  public remove(id: string) {
    return this.http.post('/Merkaba/delete', {id});
  }

  public loadSite() {
    return this.http.post('/Merkaba/loadSite', {});
  }

  public runScript(script: MerkabaScript, runNode, error) {
    console.log(runNode)
    let params = this.buildRunRequest(script,runNode)

    console.log(params)
    return this.http.lastingPost('/Merkaba/runScript', params, 15000, () => {}, error);
  }

  public buildRunRequest(script: MerkabaScript,runNode: string): any {
    console.log(script)
    let request: any = {};
    request.scriptId = script.id;

    request.deviceId = runNode;
    // request.runPort = runNode.port;

    request.scriptUri = script.uri;
    // request.scriptTitle = script.name;
    request.requireLogin = script.requireLogin|| false;
    request.loginScriptId = script.loginScriptId || '';
    request.loginScriptUri = script.loginScriptUri || '';
    request.loginAccount = script.loginAccount || '';
    request.loginTimeout = script.loginTimeout  || 1;
    request.loginSiteUrl = script.loginSiteUrl;
    request.headless = script.headless
    request.releaesEnabled = script.releaesEnabled;
    request.maxWaitTime = script.maxWaitTime
    request.proxy = script.proxy
    // request.parameters = JSON.parse(JSON.stringify(script.parameters))
    request.parameters =  typeof script.parameters == "string" ? JSON.parse(script.parameters) : script.parameters
    // request.parameters = Array.isArray(request.parameters) ? JSON.stringify(script.parameters) : script.parameters;
    Array.isArray(request.parameters) && request.parameters?.forEach(param => {
      try {
        param.value = JSON.parse(param.value)
      }catch(e) {}
    })
    console.log(request.parameters)
    console.log(Array.isArray(request.parameters) )
    // todo
    // request.variables = this.variables;
    request.taskName=script.title;
    // request.vncEnabled=script.vncEnabled;
    // todo
    // request.runType = ?
    return request;
  }

  public debugScript(param) {
    // console.error('被移除内容 需清空')
    // return this.http.post('/Merkaba/debugScript', param);
  }

  public publishScript(id: string) {
    return this.http.post('/Merkaba/publishScript', { id });
  }

  /**
   * 停止脚本
   * @param deviceId
   * @param jobId
   */
  public stopScript(deviceId: string, jobId: string) {
    return this.http.post('/Merkaba/stopScript', { deviceId, jobId });
  }

  public readLiveNodes(param) {
    return this.http.post('/Merkaba/readLiveNodes', param);
  }

  public loadNodes(param) {
    return this.http.post('/Merkaba/refreshNodes', param);
  }

  //todo 待删除
  public updateNode(param) {
    return this.http.post('/Merkaba/updateNode', param);
  }

  public readNodeInstances(params?: any) {
    return this.http.post('/Merkaba/readNodeInstances', params)
  }

  public consoleDel(params: any) {
    return this.http.post('/Merkaba/removeNode', params);
  }

  public enableWorker(params: any) {
    return this.http.post('/Merkaba/enableWorker', params);
  }

  public disableWorker(params: any) {
    return this.http.post('/Merkaba/disableWorker', params);
  }

  public removeNode(params: any) {
    return this.http.post('/Merkaba/removeNode', params);
  }

  public loadLayout(params) {
    return this.http.post('/Merkaba/layout/load', params);
  }


  public detectLayout(params) {
    return this.http.post('/Merkaba/layout/detect', params);
  }


  public removeLayout(params) {
    return this.http.post('/Merkaba/layout/delete', params);
  }

  //vnc
  public startVNC(params: any) {
    return this.http.post(`/Merkaba/startVNC`, params);
  }

  public stopVNC(params: any) {
    return this.http.post(`/Merkaba/stopVNC`, params);
  }

  //node list
  public refreshNodes(params){
    return this.http.post('/Merkaba/loadNodes', params)
  }

  public findNodes(params){
    return this.http.post('/Merkaba/findNodes', params)
  }

  public updateNodes(params){
    return this.http.post('/Merkaba/updateNode', params)
  }

  public snapshot(jobId:string, deviceId: string){
    return this.http.post('/Merkaba/snapshot', { jobId, deviceId })
  }

}
