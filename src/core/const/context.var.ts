import {InjectionToken} from "@angular/core";
import {ContextService} from "../context.service";
import {ActivatedRoute} from "@angular/router";
import {EnvironmentService} from "../environment.service";

/**
 * 重要 ！ 导入本库，需要在应用的module中实现为token传递值
 * e.g.
 * {provide: RouteData,useValue:ActivatedRoute},//需要在路由的全局设置进行提供
 * {provide: AppContext, useClass: XpaContextService},//需要继承ContextService之后绑定令牌来使用
 * {provide: AppContext, useClass: XpaRenderService},//同上
 * {provide: AppConfig, useValue: Environment},//需要根据接口创建变量
 */
export const RouteData = new InjectionToken<ActivatedRoute>("RouteData")
export const AppContext = new InjectionToken<ContextService>("AppContext")
export const AppEnv = new InjectionToken<EnvironmentService>("AppEnv")

// export const AppRender = new InjectionToken<RenderService>("AppRender")

//User Info
export interface IUserInfo {
  //用户id
  userId: string;
  //用户名
  userName: string;
  // 真实姓名
  name?: string;
  // 部门Id
  departmentId?: string;
  //部门
  departmentName?: string;
  //公司id
  companyId: string;
  // 公司名称
  companyName?: string;
  //头像
  face?: string;
  //性别
  sex?: number;
  //todo 权限
  permissions?: Array<string>;
  //todo delete 角色
  roles?: Array<any>;
  // 在部门的角色
  /**
   * enum CompanyStructureType {
   *   /// 管理员
   *   ROOT, //("ROOT", "系统管理员"),
   *   Admin, //("Admin", "公司管理员"),
   *   User, //("User", "普通用户"),
   *   Student, //("Student", "学生"),
   *   Teacher, //("Teacher", "老师"),
   *   Checker, //("Checker", "审核员"),
   *   /// 组织结构
   *   Branch, //("GroupCompany", "集团"),
   *   Company, //("Company", "公司"),
   *   Department, //("Department", "部门"),
   *   Group, //("Group", "小组"),
   *   TEAM, //("TEAM", "团队"),
   *   ConsultantDept, //("ConsultantDept", "咨询部门，专门用于李老师团队，便于筛选过滤"),
   *   /// 角色
   *   Chairman, //("Chairman", "董事长"),
   *   Boss, //("Boss", "老板"),
   *   Manager, //("Manager", "经理"),
   *   Member, //("Member", "成员"),
   *   Consultant, // ("Consultant", "咨询顾问"),
   *   Customize, //("Customize", "自定义"),
   * }
   */
  orgRole?: string;
  // 职位id
  orgId?: string;
  // 职位名称
  orgName?: string;
  //菜单
  menu?: Array<IMenu>,
}

export interface IMenu {
  id: string;
  uri?: string;
  title?: string;
  group?: string;
  children?: Array<IMenu>;
}

export enum RecordState {
  New = 0,
  Pending = 1,
  Deny = 2,
  Checked = 3,
  Open = 4,
  Close = 5,
  Invalid = 6,
  Delete = 7,
  Archive = 8,
}

export interface CompanyLogo {
  "ossType": string,
  "bucket": string,
  "contentType": string,
  "title": string,
  "uri": string,
}
