// todo 接口梳理

export interface MerkabaRecord {
  id?: string;
  parentId?: string;
  type?: number;
  name?: string;
  title?: string;
  uri?: string;
  seq?:number
  devVersion?:number;
  prdVersion?:number
  parentRecord?:MerkabaRecord
  children?:Array<MerkabaRecord>
}

export interface MerkabaNode {
  // ip: string;
  port: number;
  platform: string,
  taskCount: number,
  tasks: Array<string>,
  state: number,
  uri: string,
  title: string,
  // deviceId: string,
  id:string
}

export interface MerkabaParameter {
  name: string;
  type: 'string' | 'data';
  value: string;
}


// 保存当前脚本在tab栏的信息，脚本的状态、
export interface MerkabaScript {
  type?: number;
  id: string;
  name: string;
  uri?:string,
  title?:string;
  loginTimeout?:string,
  content: string;
  changed: boolean;
  // parameters: Array<MerkabaParameter>;
  parameters: string;
  instance?: any;
  run?: boolean;
  maxInstance?: number;
  maxWaitTime?: number;
  // monacoEditor?: any;
  editable?: boolean;
  // setLineDecoration?: Function;
  breakPoints: Array<any>;
  vncEnabled?:boolean;
  loginAccount?:string;
  requireLogin?:boolean;
  loginScriptId?:string;
  loginScriptUri?:string;
  loginScript?:any;
  loginSiteUrl?:string;
  diagnosticsOptions?:any
  imgSrc?:any;
  headless?: boolean
  releaesEnabled?:boolean
  proxy: string
  version: number
}

export interface MerkabaSite {
  id: string;
  name: string;
  url: string;
}

export interface MerkabaVariable {
  name: string;
  value: string;
}

export interface MerkabaInstance {
  scriptId?: string;
  parameters?: number;
  ip?: string;
  index?: number;
  message?: string;
}

export interface MerkabaLogSearchData {
  logSearchValue: string, //控制台搜索关键字
  currentSearchIndex: number, //搜索到的内容的现在的下标位置
  resultIndexArr: Array<number> //搜索返回的内容位置数组
}

export interface BreakPoint {
  id: string,
  name:string,
  lines: Array<number>
}
