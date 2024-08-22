import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import {forkJoin, ObservableInput} from 'rxjs';
import {AppContext} from "../core/const/context.var";
import {ContextService} from "../core/context.service";

@Injectable()
export class AuthWebGuard  {
  constructor(@Inject(AppContext) public ctx: ContextService,
              // @Inject(AppRender) public render: RenderService,
              public router: Router,
              protected http: HttpClient) {
  }


  protected promiseOf(value:boolean):Promise<boolean>{
    return new Promise(resolve => { resolve(value)});
  }

  public httpUserAuth() {
    return this.http.post<any>(this.ctx.env.restHost + '/User/auth', {}, {headers: this.ctx.env.httpHeaders}
    );
  }

  noPermissionMobile = [] //'17363167486', '18131610141'

  public authPermissionPromise(next: ActivatedRouteSnapshot):Promise<boolean>{
    let queues:Record<string, ObservableInput<any>> = {};
    if (this.ctx.isVisitor) {
      console.log("游客")
        console.log('============ctx===============')
        console.log(this.ctx)

      queues["auth"]=this.httpUserAuth();
      console.log(this.httpUserAuth())
      this.httpUserAuth().subscribe(res=>{
        console.log(res)
      })
    }

    console.log(this.httpUserAuth())
    this.httpUserAuth().subscribe(res=>{
      console.log(res)
    })

    // if(this.noPermissionMobile.includes(this.ctx.userInfo.mobile) && next.routeConfig.path) {
    //   console.log('------------非法访问------------')
    //   this.ctx.navigateUri('/', {});
    //   return new Promise<boolean>((resolve) => {resolve(false)})
    // }
    // console.log('------------访问------------')
    let permissionName="permissions";
    if (next.data[permissionName]) {
      console.log("权限验证")
      queues[permissionName]=this.ctx.env.authPermissions(next.data[permissionName]);
    }
    // if (Object.keys(queues).length==0){
    //   return this.promiseOf(true);
    // }
    return new Promise<boolean>((resolve, reject) => {
      console.log(queues)
      forkJoin(queues).subscribe((result: any) => {
        console.log(this.ctx)
        if (this.ctx.isVisitor){
          let respAuth: any = result["auth"];
          if (!this.handleAuth(resolve,respAuth)){
            if (this.ctx.env.appType == 'xpa') {
              console.log("xpa登录")
              this.ctx.navigateUri('/login', {});
            } else {
              console.log("非xpa")
              this.ctx.navigateUri('/', {});
            }
            return;
          }
        }
        if (queues[permissionName]){
          console.log("处理权限")
          let resp = result[permissionName];
          this.handlePermission(resolve,resp,next);
        }
      });
    });
  }


  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot):Promise<boolean> {
    return this.authPermissionPromise(next);
  }


  /*如果请求包含auth请求 */
  handleAuth(resolve:any,resp:any):boolean{
    let result:boolean=true;
    if (!resp || !resp.isSuccess) {
      this.ctx.fillContext({isSuccess: false});
      result=false;
    } else if (this.ctx.isVisitor) {
      this.ctx.fillContext(resp);
      result=false;
    }
    resolve(result);
    return result;
  }

  /**处理权限认证 */
  handlePermission(resolve:any,resp:any,next:any){
    let nextUri=next.url[0].path;
    this.ctx.userPrivileges.setPermissions(nextUri,resp.items);
    let hasRight = true;
    let items = next.data['permissions'];
    for (let i = 0; i < items.length; i++) {
      if (!hasRight) {
        break;
      }
      hasRight = this.ctx.userPrivileges.has(items[i]);
    }
    if (!hasRight) {
      this.router.navigate(['/accessDeny'], {});
      resolve(false);
    } else {
      resolve(true);
    }
  }
}
