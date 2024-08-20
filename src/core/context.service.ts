import {forwardRef, Inject, Injectable, NgZone} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EnvironmentService} from "./environment.service";
import {StringU} from "./utils/StringUtil";
import {AppEnv, CompanyLogo, IUserInfo, RouteData} from "./const/context.var";
// import {EventBusService} from "./event-bus/eventBus.service";
import {HttpService} from "./http.service";
import {interval} from "rxjs";

@Injectable({providedIn: 'root'})
export class ContextService {
  public userInfo: IUserInfo = {
    userId: "",
    userName: "",
    companyId: "",
  };
  public icon!: string;
  public title: string = '';
  public id!: string;
  public companyLogo: CompanyLogo;

  public get timestamp(): number {
    return Date.now();
  }

  public pages: any = {};
  public deviceWidth!: number;
  public deviceHeight!: number;
  public now: number = Date.now();
  //当前页面地址
  public referer: string = "";

  constructor(
    @Inject(AppEnv) public env: EnvironmentService,
    @Inject(forwardRef(()=>RouteData)) protected route: ActivatedRoute,
    public router: Router,
    // public bus: EventBusService,
    public zone: NgZone,
    protected http: HttpService,
  ) {
    interval(500).subscribe(()=>this.now=Date.now());
  }

  /**
   * 当前APP的名称
   */
  public get appType() {
    return this.env.appVersion;
  }

  /**
   * 当前的版本号
   */
  public get appVersion() {
    return this.env.appVersion;
  }

  /**
   * 当前角色
   */
  public get roleName() {
    return !this.userInfo.roles || this.userInfo.roles.length == 0 ? '' : this.userInfo.roles.join(',');
  }

  /**
   * 填充上下文
   * @param result
   */
  public fillContext(result: any): boolean {
    if (!result.isSuccess) {
      return false;
    }
    this.renderUser(result);
    this.companyLogo = result?.companyLogo;
    this.env.fillDomain(result);
    this.setCookieId(result.cookieId);
    return true;
  }

  /**
   * 设置cookieId
   * @param value
   * @private
   */
  private setCookieId(value: string) {
    this.id = value;
    this.env.setCookieId(value);
  }

  /**
   * 是否为访客
   */
  public get isVisitor() {
    return !this.userInfo?.userId?.length;
  }

  /**
   * 是否有权限
   * @param permission
   * @returns
   */
  public hasPermission(permission: any): Promise<boolean> {
    return new Promise(resolve => {
      if (!Array.isArray(permission)) {
        permission = [permission.toString()];
      }
      this.env.authPermissions(permission).subscribe((res: any) => {
        resolve(res);
      });
    });
  }

  /**
   * 清除用户信息
   * @private
   */
  private clearUser() {
    this.userInfo = {
      userId: '',
      userName: '',
      companyId: ''
    }
  }

  /**
   * 填充user Info
   * @param result
   * @private
   */
  private renderUser(result: any) {
    this.userInfo = {
      userId: result.userId,
      userName: result.userName,
      name: result.name,
      companyId: result.companyId,
      companyName: result.companyName,
      // todo 待修改同步
      departmentId: result.deptId,
      departmentName: result.deptName,
      orgId: result.orgId,
      orgName: result.orgName,
      sex: result.sex,
      face: this.faceUri(result?.userId),
      permissions: result.permissions,
      roles: result.roles,
      orgRole: result.orgRole,
    }
  }

  /**
   * 退出登录
   */
  public async logout() {
    let resp: any = await this.http.post('/User/logout').toPromise();
    if (!resp || !resp.isSuccess) {
      return;
    }
    this.setCookieId(resp.cookieId);
    this.clearUser();
  }

  /**
   * 抛出异常
   * @param result
   */
  public throwErr(result: any) {
    let message = result.message || 'Server Error';
    throw new Error(message);
  }

  /**
   * 获取真实平台系统
   */
  public getPlatform(){
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'iOS';
    }
    if (userAgent.includes('mac os')) {
      return 'Mac';
    }
    if (userAgent.includes('windows')) {
      return 'Windows';
    }
    if (userAgent.includes('android')) {
      return 'Android';
    }
    if (userAgent.includes('linux')) {
      return 'Linux';
    }
    if (userAgent.includes('cros')) {
      return 'Chrome OS';
    }
    if (userAgent.includes('blackberry') || userAgent.includes('bb10')) {
      return 'BlackBerry';
    }
    if (userAgent.includes('nokia')) {
      return 'Nokia';
    }
    if (userAgent.includes('windows phone')) {
      return 'Windows Phone';
    }
    return 'Unknown';
  }
  /**
   * 根据提供的相对路径返回完整的接口路径
   * @param path
   */
  public urlBy(path: string): string {
    let result: string[] = [];
    result.push(this.env.restHost);
    result.push(path);
    return result.join('');
  }

  /**
   * 我的头像uri
   */
  public myFaceUri() {
    return this.faceUri(this.userInfo.userId);
  }

  /**
   * 头像uri
   * @param userId
   */
  public faceUri(userId: string) {
    if (!this.env.faceDomain) {
      return undefined;
    }
    if (userId?.length == 0) {
      return this.env.faceDomain + '/default.jpg';
    }
    return this.env.faceDomain + '/' + userId + '.jpg?timestamp=' + this.timestamp;
  }

  /**
   * 图片的uri
   * @param v
   */
  public pictureUri(v: string) {
    if (this.env.pictureDomain && !StringU.isEmpty(v)) {
      return this.env.pictureDomain.replace('KEY', v).replace(/\?x-oss.*$/gm, '');
    } else {
      return "";
    }
  }

  /**
   * 截图uri
   * @param v
   */
  public shotUri(v: string) {
    if (this.env.pictureShot && !StringU.isEmpty(v)) {
      return this.env.pictureShot.replace('KEY', v).replace(/\?x-oss.*$/gm, '');
    } else {
      return '';
    }
  }

  /**
   * 相册uri
   * @param v
   */
  public thumbUri(v: string) {
    if (this.env.pictureThumb && !StringU.isEmpty(v)) {
      return this.env.pictureThumb.replace('KEY', v).replace(/\?x-oss.*$/gm, '');
    } else {
      return '';
    }
  }

  /**
   * 图片uir
   * @param v
   */
  public imageUri(v: string) {
    if (this.env.privateImageDomain && !StringU.isEmpty(v)) {
      return this.env.privateImageDomain.replace('KEY', v).replace(/\?x-oss.*$/gm, '');
    } else {
      return '';
    }
  }

  /**
   * 视频地址
   * @param v
   */
  public videoUri(v: string) {
    if (this.env.videoDomain && !StringU.isEmpty(v)) {
      return this.env.videoDomain.replace('KEY', v).replace(/\?x-oss.*$/gm, '');
    } else {
      return '';
    }
  }

  /**
   * 视频截图地址
   * @param v
   */
  public videoSnapshotUri(v: string) {
    return v + '?' + this.env.videoSnapshotSchema;
  }

  /**
   * 音频地址
   * @param v
   */
  public audioUri(v: string) {
    if (this.env.audioDomain && !StringU.isEmpty(v)) {
      return this.env.audioDomain.replace('KEY', v).replace(/\?x-oss.*$/gm, '');
    } else {
      return '';
    }
  }

  /**
   * 文件地址
   * @param v
   */
  public fileUri(v: string) {
    if (this.env.fileDomain && !StringU.isEmpty(v)) {
      return this.env.fileDomain.replace('KEY', v).replace(/\?x-oss.*$/gm, '');
    } else {
      return '';
    }
  }

  /**
   * 资源地址
   * @param folder
   * @param fileName
   */
  public assetUri(folder: string, fileName: string): string {
    let buf: Array<string> = [];
    buf.push(this.env.assetDomain);
    buf.push(folder);
    buf.push(fileName);
    return buf.join('/');
  }

  /**
   * 网站地址
   * @param siteName
   */
  webDomains(siteName: string) {
    let value;
    this.env.domains.forEach((res: any) => {
      if (res.name == siteName) {
        value = res.value;
      }
    });
    return value;
  }

  /**
   * 通过uri跳转
   * @param domain
   * @param uri
   */
  public navigateByUrl(domain: Array<string>, uri: string) {
    let hasSite = false;
    for (let i = 0; i < domain?.length; i++) {
      if (domain[i] === this.env.siteName) {
        hasSite = true;
        break;
      }
    }
    if (hasSite) {
      this.router.navigate([uri]);
    } else {
      let domainUri: string | undefined = this.webDomains(this.env.siteName);
      let url = domainUri + uri;
      window.location.href = url;
    }

  }

  /**
   * 通过uri跳转（可以传入参数）
   * @param uri
   * @param params
   */
  public navigateUri(uri: string, params?: any) {
    let extra: any = {queryParams: params == null ? {} : params};
    this.router.navigateByUrl(uri, extra)
  }

  /**
   * 路由跳转传参
   * @param uri
   * @param params
   */
  public navigateByUrlWithParams(uri: string, params: any) {
    this.navigateUri(uri, params);
  }
}
