import { Injectable } from '@angular/core';
import {HttpService} from "../core/http.service";

type AppType = 'xpa';

export interface userInfo {
  userId?: string;
  userName: string;
  face: any;
  name: string;
  userType: number;
  mobile?: number;
  email?: string;
  password?: string;
  birthday: number;
  appType: AppType
}
// todo 邮箱和手机验证码的接口暂时不用
@Injectable()
export class UserService {
  constructor(protected http: HttpService) {}

  /**
   * 读取用户列表
   * @param params
   */
  public readUsers(params: any) {
    return this.http.post('/User/userList', params);
  }

  /**
   * 查看用户信息
   * @param userId
   */
  public getUserInfo(userId: string) {
    return this.http.post('/User/userInfo', {userId: userId});
  }

  /**
   * 查看用户详情
   */
  public getUserDetail(userId: string) {
    return this.http.post('/User/userDetail', {userId: userId});
  }

  /**
   * 删除用户
   */
  public deleteUser(userIds: Array<string>) {
    return this.http.post('/User/deleteUser', {userIds});
  }

  /**
   * 重置用户密码
   */
  public resetUserPassword(userId: string) {
    return this.http.post('/User/resetPwd', {userId: userId});
  }

  /** 修改用户信息*/
  public updateUserInfo(params: userInfo) {
    return this.http.post('/User/updateUserInfo', params);
  }

  /**
   * 增加用户
   */
  public addUser(params: userInfo) {
    return this.http.post('/User/addUser', params);
  }

  /**
   * 获取用户类型
   */
  public getUserType() {
    return this.http.post('/User/userType');
  }

  /**
   * 邮箱和手机注册
   * @param params
   */
  public register(params:any) {
    return this.http.post('/User/register', params);
  }

  public registerInfor(params:any) {
    return this.http.post('/User/perfectInfo', params);
  }

  public login(params:any) {
    return this.http.post('/User/login', params);
  }

  public bindWeChat(params: any) {
    return this.http.post('/User/bindWeChat', params);
  }

  public bindWeChatToNewUser(params: any) {
    return this.http.post('/User/bindWeChatToNewUser', params);
  }

  public checkMobile(params: any) {
    return this.http.post('/User/checkMobile', params);
  }

  update(params: any) {
    return this.http.post('/User/update', params);
  }

  readSimplify(keyword: string) {
    return this.http.post('/Company/readSimplify', {keyword});
  }
}

