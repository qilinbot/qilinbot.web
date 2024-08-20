import {Injectable} from "@angular/core";
import {ObjectU} from "./utils/ObjectUtil";

@Injectable({
  providedIn:"root"
})

/**
 * 提供一套对cookie和localStorage的增删改查
 */
export class StoreService{
  public cookieController = new CookieController(document);
  public localStorageController = new LocalStorageController();
}

/**
 * cookie helper
 */
export class CookieController{
  documentIsAccessible: boolean = false;

  constructor(private document: Document) {
    this.documentIsAccessible = true;
  }

  /**
   * 检查cookie是否存在
   * @param name
   */
  public checkCookie(name: string): boolean {
    if (!this.documentIsAccessible) {
      return false;
    }
    name = encodeURIComponent(name);
    const regExp: RegExp = this.getCookieRegExp(name);
    const exists: boolean = regExp.test(this.document.cookie);
    return exists;
  }

  /**
   * 获取cookie
   * @param name
   */
  public getCookie(name: string): string {
    if (this.documentIsAccessible && this.checkCookie(name)) {
      name = encodeURIComponent(name);
      const regExp: RegExp = this.getCookieRegExp(name);
      const result: RegExpExecArray = regExp.exec(this.document.cookie) as RegExpExecArray;
      return decodeURIComponent(result[1]);
    } else {
      return '';
    }
  }

  /**
   * 获取全部cookie
   */
  getAllCookies(): {[key:string]:string} {
    if (!this.documentIsAccessible) {
      return {};
    }
    const cookies: any = {};
    const document: any = this.document;
    if (document.cookie && document.cookie !== '') {
      const split: Array<string> = document.cookie.split(';');
      for (let i = 0; i < split.length; i += 1) {
        const currentCookie: Array<string> = split[i].split('=');
        currentCookie[0] = currentCookie[0].replace(/^ /, '');
        cookies[decodeURIComponent(currentCookie[0])] = decodeURIComponent(currentCookie[1]);
      }
    }
    return cookies;
  }

  /**
   * 设置cookie
   * @param domain
   * @param name
   * @param value
   * @param expires
   */
  setCookie(domain: string, name: string, value: string, expires?: number | Date,): void {
    if (!this.documentIsAccessible) {
      return;
    }
    let cookieString: string = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';
    if (expires) {
      if (typeof expires === 'number') {
        const dateExpires: Date = new Date(new Date().getTime() + expires * 1000 * 60 * 60 * 24);
        cookieString += 'expires=' + dateExpires.toUTCString() + ';';
      } else {
        cookieString += 'expires=' + expires.toUTCString() + ';';
      }
    }
    cookieString += 'path=/;domain=' + domain;
    this.document.cookie = cookieString;
  }

  /**
   * 移除cookie
   * @param domain
   * @param name
   */
  removeCookie(domain:string, name: string): void {
    if (!this.documentIsAccessible) {
      return;
    }
    this.setCookie(domain, name, '', -1);
  }

  /**
   * 清除cookie
   * @param domain
   */
  clearCookies(domain:string): void {
    if (!this.documentIsAccessible) {
      return;
    }
    const cookies: any = this.getAllCookies();
    for (const cookieName in cookies) {
      if (cookies.hasOwnProperty(cookieName)) {
        this.removeCookie(domain,cookieName);
      }
    }
  }

  /**
   * 私有-获取cookie的正则匹配对象
   * @param name
   * @private
   */
  private getCookieRegExp(name: string): RegExp {
    const escapedName: string = name.replace(/([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/ig, '\\$1');
    return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g');
  }

}

/**
 * local storage helper
 */
export class LocalStorageController{
  constructor() {
    if (!this.isStorageAvailable) {
      this.warn('The local storage is not available on this platform.');
    }
  }

  /**
   * 只读 - window.localStorage
   * @private
   */
  private readonly storage: Storage | null  =
    (typeof window !== 'undefined' && window.hasOwnProperty('localStorage'))
      ? window.localStorage
      : null;
  /**
   * 私有 - 键值对形式存储
   * @private
   */
  private map: Map<string, any> = new Map();
  /**
   * ⚠️警告函数
   * @param text
   */
  private warn = (text: string) => {
    if (console && console.warn) {
      console.warn(text);
    }
  };

  /**
   * 暴露localStorage
   */
  get localStorage(){
    return this.storage;
  }

  /**
   * 是否存在记录
   */
  public has(token:string){
    let result: boolean  = false;
    if(this.storage){
      result = !!this.storage?.getItem(token);
    }
    return result;
  }
  /**
   * 获取项
   * @param token
   */
  public get(token: string): any {
    if (this.map.has(token)) {
      return this.map.get(token);
    }
    let rawData = null;
    if (this.isStorageAvailable && this.storage) {
      rawData = this.storage?.getItem(token)??null;
    }
    let result: any;
    if (rawData !== null) {
      try {
        result = JSON.parse(rawData);
      } catch (error) {
        return
      }
    }
    if (!ObjectU.isNull(result)){
      this.map.set(token, result);
    }
    return result;
  }

  /**
   * 设置项
   * @param token
   * @param data
   */
  public set<T = any>(token: string, data: T): void {
    const rawData: string = JSON.stringify(data);
    if (this.isStorageAvailable && this.storage) {
      this.storage?.setItem(token, rawData);
    }
    if (!this.map.has(token)) {
      return;
    }
    const current = JSON.stringify(this.map.get(token));
    if (current === rawData) {
      return;
    }
    if (!ObjectU.isNull(data)){
      this.map.set(token, data);
    }
  }

  /**
   * 删除
   * @param token
   */
  public remove(token: string): void {
    if (this.isStorageAvailable && this.storage) {
      this.storage?.removeItem(token);
    }
    this.map.delete(token);
  }

  /**
   * 清理
   */
  public clear(): void {
    if (this.isStorageAvailable && this.storage) {
      this.storage?.clear();
    }
    this.map.clear();
  }

  /**
   * 判断是否可用
   * @private
   */
  private get isStorageAvailable() {
    return !!this.storage;
  }
}
