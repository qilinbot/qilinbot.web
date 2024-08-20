import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Environment} from "../environments/environment";

type AppType = 'xpa';

export interface UserInfo {
  userId?: string;
  userName: string;
  face: any;
  name: string;
  userType: number;
  mobile?: number;
  email?: string;
  password?: string;
  birthday: number;
  appType: AppType;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // 替换为实际API地址
  private apiUrl = Environment.restHost;

  constructor(private http: HttpClient) {}

  /**
   * 读取用户列表
   * @param params
   */
  readUsers(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  /**
   * 查看用户信息
   * @param userId
   */
  getUserInfo(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * 查看用户详情
   */
  getUserDetail(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/details/${userId}`);
  }

  /**
   * 删除用户
   */
  deleteUser(userIds: Array<string>): Observable<any> {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: { userIds }
    };
    return this.http.delete(`${this.apiUrl}/users`, options);
  }

  /**
   * 重置用户密码
   */
  resetUserPassword(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/reset-password`, { userId });
  }

  /** 修改用户信息 */
  updateUserInfo(params: UserInfo): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${params.userId}`, params);
  }

  /**
   * 增加用户
   */
  addUser(params: UserInfo): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, params);
  }

  /**
   * 获取用户类型
   */
  getUserType(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/types`);
  }

  /**
   * 邮箱和手机注册
   * @param params
   */
  register(params: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, params);
  }

  registerInfor(params: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register-info`, params);
  }

  login(params: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, params);
  }

  bindWeChat(params: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/bind-wechat`, params);
  }

  bindWeChatToNewUser(params: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/bind-wechat-new`, params);
  }

  checkMobile(params: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/check-mobile`, params);
  }

  update(params: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/update`, params);
  }

  readSimplify(keyword: string): Observable<any> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get(`${this.apiUrl}/users/simplify`, { params });
  }
}
