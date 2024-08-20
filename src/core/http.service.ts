import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import Swal from 'sweetalert2';
import {EnvironmentService} from "./environment.service";
import {AppEnv} from "./const/context.var";
import {Router} from "@angular/router";

export const ERROR_EMPTY = '不能为空';
export const ERROR_NOCONTENT = '未知名错误消息';

export interface HttpLocal {
  enabled: boolean;
  fileName: string;
}

export interface HttpData {
  name: string;
  data: any;
}

@Injectable({providedIn: "root"})
export class HttpService {
  constructor(
    @Inject(AppEnv) public env: EnvironmentService,
    public router:Router,
    protected http: HttpClient) {
    //DISABLE console.log(this.restHost)
  }

  /**
   * 创建本地资源
   * @param fileName
   * @param enabled
   */
  public createLocal(fileName: string, enabled: boolean): HttpLocal {
    let result: HttpLocal = <HttpLocal>{};
    result.fileName = fileName;
    result.enabled = enabled;
    return result;
  }

  /**
   * 异步POST请求
   * @param uri
   * @param params
   */
  public async postAsync(uri: string, params?: any) {
    let oHttp: Observable<any> = this.http.post<any>(
      this.env.restHost + uri,
      params,
      {headers: this.env.httpHeaders}
    );
    return await oHttp.toPromise();
  }

  /**
   * 本地GET请求
   * @param uri
   */
  public getLocal(uri: string): Observable<Object> {
    return this.http.get(uri);
  }

  /**
   * 是否是本地请求
   * @param local
   * @private
   */
  private isFromLocal(local?: HttpLocal) {
    return this.env.developMode && local && local.enabled;
  }

  /**
   * 网络GET请求
   * @param uri
   * @param params
   * @param local
   * @param onCallback
   * @param onError
   */
  public get(uri: string, params?: any, local?: HttpLocal, onCallback?: (resp: any) => void, onError?:(resp:any)=>void): Observable<any> {
    if (this.isFromLocal(local)) {
      return this.getLocal(local!.fileName);
    } else {
      return this.doPost(uri, params ? params : {}, onCallback,onError);
    }
  }

  /**
   * log的本地封装
   * @param rest
   * @private
   */
  private log(...rest: any[]) {
    //DISABLE console.log(...rest)
  }

  /**
   * trace的本地封装
   * @param rest
   * @private
   */
  private trace(...rest: any[]) {
    console.trace(...rest);
  }

  /**
   * 弹窗ERROR报错
   * @param message
   */
  public error(message: string) {
    Swal.fire({
      html: `<div class="info-title">
            <i class="CORE core-error_fill" style="color:#FF4D4F"></i>
            <p>错误</p>
        </div>
        <div class="message">
            <p>${message}</p>
        </div>
`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      reverseButtons: true,
      customClass: {
        popup: 'SwalToastPopup',
        actions: 'SwalToastActions',
        confirmButton: 'SwalToastConfirmButton',
        cancelButton: 'SwalToastCancelButton',
        htmlContainer: 'SwalToastHtmlContainer'
      }
    });
  }

  /**
   * POST请求
   * @param uri
   * @param params
   * @param local
   * @param onCallback
   * @param onError
   */
  public post(uri: string, params?: any, local?: HttpLocal, onCallback?: (resp: any) => void, onError?:(resp:any)=>void): Observable<any> {
    if (this.isFromLocal(local)) {
      return this.getLocal(local!.fileName);
    } else {
      return this.doPost(uri, params ? params : {}, onCallback,onError);
    }
  }

  public lastingPost(uri: string, params?: any, time = 120000, onCallback?: (resp: any) => void, onError?:(resp:any)=>void): Observable<any> {
    return this.doPost(uri, params ? params : {}, onCallback,onError, time);
  }

  /**
   * POST请求
   * @param uri
   * @param params
   * @param onCallback
   * @param onError
   * @param time
   */
  public doPost(uri: string, params: any, onCallback?: (resp: any) => void, onError?:(resp:any)=>void, time: number = 50000): Observable<any> {
    // if (this.ctx.referer.indexOf('/') > -1) {
    //   this.ctx.referer = this.ctx.referer.split('/', 1).join();
    // }
    var url: string = uri.startsWith('http') ? uri : this.env.restHost + uri;
    let result: any = this.http.post<any>(url, params, {headers: this.env.httpHeaders});
    let self = this;
    return new Observable<any>(observer => {
      result
        .pipe(timeout(time))
        .subscribe(
        (resp: any) => {
          if (Array.isArray(resp) || resp.isSuccess) {
            if (onCallback) {
              onCallback(resp);
            }
            observer.next(resp);
            observer.complete();
          } else {
            let error: string = resp.error ? resp.error : ERROR_NOCONTENT
            if(onError) {
              onError(resp)
            }
            self.error(error);
            observer.error(error);
          }
        },
        (error: any) => {
          switch (error.status) {
            case 503:
              this.router.navigate(['/503']);
              break;
            case 404:
              this.router.navigate(['/404']);
              break;
            default:
              if(onError) {
                onError(error)
              }
              break;
          }
          console.error(`[HTTP]:${error}`)
        }
      );
    });
  }


}
