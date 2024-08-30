import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {ContextService} from "../../core/context.service";
import {AppContext} from "../../core/const/context.var";
import {ActivatedRoute} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {RenderService} from "../../core/render.service";
import {SocketClient} from "../../core/net/socketclient";
export enum AuthCardStatus {
  LOGIN,//user password
  REGISTER,//register
  SMS,//message
  WECHAT,//wechat
  LoginMobile,
  LoginEmail,
  RegisterMobile,
  RegisterEmail,
}
@Component({
  selector: 'app-login.web',
  standalone: true,
  imports: [
    FormsModule,
    NzButtonComponent,
  ],
  templateUrl: './login.web.component.html',
  styleUrl: './login.web.component.scss'
})
export class LoginWebComponent implements OnInit{
  public loginType:AuthCardStatus;

  username:string="";//账号
  password:string="";//密码
  loginCode:number;//登录验证

  registerUser:string="";//邮件 或者手机号
  passwordRepeat:string="";//重复密码
  isRemember:boolean=false;
  registerCode:number;//注册码
  registerType:string='email';//tel

  qrCodeUrl:string="";//登录二维码

  public socket: SocketClient;
  constructor(
    public userService: UserService,
    // public userService: UserService,
    @Inject(AppContext) public ctx: ContextService,
    protected render: RenderService,
    protected route: ActivatedRoute,
    protected cdr: ChangeDetectorRef,
  ) { }
  ngOnInit(){
    let userInfo = JSON.parse(localStorage.getItem('userInfo'))
    console.log(userInfo);
    // if(userInfo) {
    //   this.username = userInfo.userName;
    //   this.password = userInfo.password;
    // }
    //如果是首页跳转
    this.route.queryParamMap.subscribe(res=>{
      console.log(res)
      if(res.get("state")=="register"){
        this.loginType=AuthCardStatus.REGISTER;
      }else{
        this.loginType=AuthCardStatus.LOGIN;
      }
    })

    setTimeout(() => {
      this.initSocket();
    }, 100);
  }

  login(){
    let oReq: any;

    switch (this.loginType) {
      case AuthCardStatus.REGISTER:
        let params={};
        if(this.registerType=="email"){
          params={
            "isTeacher":false,
            "password":this.password,
            "mobile":this.registerUser,
            "code":this.registerCode,
            "countryCode":"+86"
          };

        }else{
          params={
            "isTeacher":false,
            "email":this.password,
            "emailCode":this.registerCode,
            "password":this.password,
          };
          this.userService.register(params).subscribe((res: any) => {
            if (res.isSuccess) {
              // todo 显示弹窗 注册成功
              // this.render.info('注册成功')
              console.log("注册成功")
              this.toggleLogin()
            }
          })
        }

        break;
      case AuthCardStatus.LOGIN:
        oReq ={userName:this.username,password:this.password};

        console.log("登录",oReq)
        oReq['action'] = 'login';
        this.userService.login(oReq).subscribe((res: any) => {
          console.log("login",res)
          if (res.isSuccess) {
            // if(this.isRemember) localStorage.setItem('userInfo', JSON.stringify(oReq))
            this.handleLogin(res);
          }
        });
        break;
      case AuthCardStatus.SMS:
        oReq ={mobile:this.username,code:this.loginCode};
        oReq['action'] = 'login';
        oReq['countryCode'] = '+86';
        this.userService.login(oReq).subscribe((res: any) => {
          if (res.isSuccess) {
            this.handleLogin(res);
          }
        })
        break;
      default:
        console.log('其他');
        break;
    }
  }

  /**
   * 切换注册和登录
   */
  toggleLogin(){
    this.loginType=this.loginType==AuthCardStatus.LOGIN?AuthCardStatus.REGISTER:AuthCardStatus.LOGIN;
  }

  protected handleLogin(oData:any){
    console.log("处理登录",oData)
    if (this.ctx.fillContext(oData)){
      this.ctx.router.navigate(['/'], {});
    }
  }
  getWebLoginQRCode() {
    let oReq: any = {};
    oReq['service'] = 'auth';
    oReq['action'] = 'getWebLoginQRCode';
    this.socket.send(oReq).subscribe(error => {
    });
  }

  protected initSocket() {
    let self = this;
    let cookieId: string = this.ctx.id;
    this.socket = new SocketClient(this.ctx.env.webSocket('auth'), cookieId);
    this.socket.connect(false);
    this.socket.onError(resp => {
      console.log(resp);
    });
    this.socket.onOpen(resp => {
      self.getWebLoginQRCode();
    });
    this.socket.onMessage((event: MessageEvent) => {
      let oData: any = JSON.parse(event.data);
      console.log('onMessage', oData);
      if (!oData.isSuccess) {
        this.render.error(oData.message);
        return;
      }
      let serviceName = oData['serviceName'];
      switch (serviceName) {
        case 'scan':
          if (oData.action == 'webLogin') {
            self.handleLogin(oData);
          }
          break;
        case 'auth':
          if (oData.action == 'getWebLoginQRCode') {
            setTimeout(() => {
              this.qrCodeUrl = oData.image;
            });
            this.cdr.detectChanges();
          } else if (oData.action == 'register') {
            this.render.info('注册成功');
            this.loginType=AuthCardStatus.LOGIN;
          } else if (oData.action = 'login') {
            this.handleLogin(oData);
          }
          break;
      }
    });
  }


}
