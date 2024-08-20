import {forwardRef, Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {AppConfig, Device, DeviceModel, IEnvironmentConfig, RunMode} from './const/environment.var';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {ObjectId} from "./utils/ObjectId";
import {StringU} from "./utils/StringUtil";
import {StoreService} from "./store.service";


@Injectable({providedIn: 'root'})
export class EnvironmentService {
  public protocol: string = "http:";
  public cookieId: string = "";
  public developMode: boolean = false;
  public isBrowser: boolean = false;
  public device: Device = Device.web;
  public deviceModel: DeviceModel = DeviceModel.default;
  public runMode: RunMode = RunMode.Browser;
  public ossBucketPrefix: string = "";
  public domain: string = "";
  public siteDomain: string = "";
  public attachmentDomain: string = "";
  public fileDomain: string = "";
  public pdfDomain:string = "";
  public pptDomain:string = "";
  public faceDomain: string = "";
  public imageDomain: string = "";
  public pictureDomain: string = "";
  public pictureShot: string = "";
  public pictureThumb: string = "";
  public privateImageDomain: string = "";
  public videoDomain: string = "";
  public videoSnapshotSchema: string = "";
  public liveDomain: string = "";
  public liveAppId: string = "";
  public audioDomain: string = "";
  public assetDomain: string = "";
  public shareDomain: string = "";
  public shareUri: string = "";
  public webChatHost: string = "";
  public websocketHost: string = "";
  public eventSourceHost: string = "";
  public domains: Array<string> = [];

  public isReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  /**
   * AppConfig 需要在App.module中提供值 {provide:AppConfig,useValue:Environment}
   * @param config
   * @param platformId
   * @param store
   * @param http
   */
  constructor(@Inject(forwardRef(() => AppConfig)) public config: IEnvironmentConfig,
              @Inject(PLATFORM_ID) public platformId: Object,
              public store: StoreService,
              public http: HttpClient) {
  }

  public initDevice() {
    let d = this.getCookieValue('device');
    switch (d?.toLowerCase()) {
      case 'ios':
        this.device = Device.ios;
        break;
      case 'android':
        this.device = Device.android;
        break;
      case "desktop":
        this.device = Device.desktop;
        break;
      // 后续的暂时用不上
      case "mac":
        this.device = Device.mac;
        break;
      case "win":
        this.device = Device.win;
        break;
      case "linux":
        this.device = Device.linux;
        break;
      case 'wechat':
        this.device = Device.wechat;
        break;
      default:
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
          //判断iPhone|iPad|iPod|iOS
          this.device = Device.web;// Device.h5
        } else if (/(Android)/i.test(navigator.userAgent)) {
          //判断Android
          this.device = Device.web;// Device.h5
        } else {
          //pc
          this.device = Device.web;
        }
        break;
    }
    switch (this.device) {
      case Device.ios:
      case Device.android:
        this.cookieId = this.getCookieValue('cookieId');
        break;
      default:
        let value = this.getCookieValue('cookieId');
        if (!value) {
          value = ObjectId.create();
          this.setCookieId(value);
        }
        this.cookieId = value ? value : '';
        break;
    }
    this.developMode = !this.config.isProduction;
    if (isPlatformServer(this.platformId)) {
      this.isBrowser = false;
      this.runMode = RunMode.NodeJS;
    } else if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
      this.runMode = RunMode.Browser;
    } else{  // 其他全部当成h5处理
      this.isBrowser = true;
      this.runMode = RunMode.Mobile;
    }
  }

  /**
   * 初始化auth请求
   * @param protocol 类型要求是 http: 或者 https:
   */
  public initAuth(protocol: string) {
    this.protocol = protocol;
    return this.http.post<any>(this.restHost + '/User/auth', {}, {headers: this.httpHeaders});
  }

  public authPermissions(uris: string[]): Observable<any> {
    let param: any = {uris};
    return this.http.post(this.restHost + '/Permission/readUser', param, {headers: this.httpHeaders});
  }

  public fillDomain(result: any) {
    this.ossBucketPrefix = result.ossBucketPrefix;
    this.faceDomain = result.faceDomain;
    this.imageDomain = result.imageDomain;
    this.pictureDomain = result.pictureDomain;
    this.pictureShot = result.pictureShot;
    this.pictureThumb = result.pictureThumb;
    this.privateImageDomain = result.privateImageDomain;
    this.videoDomain = result.videoDomain;
    this.videoSnapshotSchema = result.videoSnapshotSchema;
    this.audioDomain = result.audioDomain;
    this.assetDomain = result.assetDomain;
    this.fileDomain = result.fileDomain;
    this.pdfDomain = result.pdfDomain;
    this.pptDomain = result.pptDomain;
    this.liveDomain = result.liveDomain;
    this.liveAppId = result.liveAppId;
    this.attachmentDomain = result.attachmentDomain;
    this.shareDomain = result.shareDomain;
    if (result.webConfig) {
      if (this.config.isProduction) {
        this.config.restHost = result.webConfig.restHost;
      }
      this.domain = result.webConfig.domain;
      this.siteDomain = result.webConfig.siteDomain;
      this.domains = result.webConfig.domains;
      this.shareUri = result.webConfig.shareUri;
      this.webChatHost = result.webConfig.webChatHost;
      this.websocketHost = result.webConfig.websocketHost;
      this.eventSourceHost = result.webConfig.eventSourceHost;
    }
    this.isReady$.next(true);
  }


  public setCookieId(value: string) {
    this.cookieId = value;
    this.setCookieValue('cookieId', value);
  }

  public getCookieValue(key:string){
    return this.store.cookieController.getCookie(key);
  }
  public setCookieValue(key: string, value: any) {
    const expire = new Date();
    expire.setHours(expire.getHours() + 7 * 24);
    this.store.cookieController.setCookie(this.siteDomain, key, value, expire);
  }

  /**
   * 设置httpHeaders
   * @param headers
   */
  public setHttpHeaders(headers: any) {
    this.httpHeaders = this.getHttpHeaders(headers);
  }

  /**
   * 获取httpHeaders对象
   */
  public getHttpHeaders(headers:Record<string, any>){
    return new HttpHeaders(Object.assign({
      cookieId: this.cookieId,
      siteName: this.siteName,
      device: this.deviceType,
      appType: this.appType,
      envType: this.envType!,
      appVersion: this.appVersion
    }, headers))
  }

  // 默认headers
  private _httpHeaders: HttpHeaders;
  /**
   * 获取http的headers
   */
  public get httpHeaders(): HttpHeaders {
    if (this._httpHeaders) {
      return this._httpHeaders;
    } else {
      return this.getHttpHeaders({})
    }
  }

  public set httpHeaders(headers: any) {
    if (headers instanceof HttpHeaders) {
      this._httpHeaders = headers;
    } else {
      this._httpHeaders = new HttpHeaders(headers);
    }
  }

  public get isAndroid(): boolean {
    let u = navigator.userAgent;
    return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;   //判断是否是 android终端
  }

  public get isIOS(): boolean {
    let u = navigator.userAgent;
    return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);     //判断是否是 iOS终端
  }

  public webSocket(topic: string) {
    return this.webSocketUri(topic);
  }

  public webSocketUri(topic: string): string {
    let buf: Array<string> = [];
    buf.push(this.websocketHost);
    buf.push('?topic=' + topic);
    return buf.join('');
  }

  // 获取eventSource的地址
  get eventSourceUrl() {
    return this.eventSourceHost;
  }

  public get isWeb() {
    return this.device <= Device.web;
  }

  public get restHost(): string {
    return this.readHostUri(this.protocol);
  }

  public get restSessionHost(): string {
    return sessionStorage['host'];
  }

  get deviceType() {
    switch (this.device) {
      case Device.android:
        return "Android";
      case Device.h5:
        return "H5";
      case Device.ios:
        return "IOS";
      case Device.desktop:
        return "Desktop";
      case Device.linux:
        return "Linux"
      case Device.mac:
        return "Mac"
      case Device.wechat:
        return "WeChat";
      case Device.web:
      default:
        return "MobileBrowser";
    }
  }

  get appType(): string {
    return this.config.appType;
  }

  get appVersion(): string {
    return this.config.appVersion;
  }

  get envType() {
    return this.config.envType;
  }

  get siteName(): string {
    return this.config.siteName;
  }

  private readHostUri(protocol: string) {
    let buf: Array<string> = [];
    let host: string = !StringU.isEmpty(this.restSessionHost) ? this.restSessionHost : this.config.restHost;
    if (!host.startsWith('http')) {
      if (!protocol) protocol = 'http:';
      buf.push(protocol);
      buf.push('//');
    }
    buf.push(host);
    return buf.join('');
  }

}
