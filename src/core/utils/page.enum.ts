export enum EditMode {
  NONE = 0,
  DELETE,
  INSERT,
  UPDATE
}
export enum PageLayout {
  NORMAL = 0,
  FULLSCREEN,
  FULLWIDTH,
  HOMEPAGE,
  PLAY,
  PORTAL,
  NOHEADER
}

export enum RunMode {
  Browser = 0,
  NodeJS = 1,
  Mobile = 2
}

export class OrganizeRole {
  id!: string;
  parentId!: string;
  name!: string;
  children?: Array<OrganizeRole>;
  type!: string;
  seq!: number;
}


export class UserPrivileges {
  private permissions: Set<string> = new Set();
  private loadedUris: Set<string> = new Set();

  public setPermissions(uri: string, items: any) {
    items.forEach((item:any) => {
      this.permissions.add(item);
    });
    this.loadedUris.add(uri);
  }

  public isLoaded(uri: string): boolean {
    return this.loadedUris.has(uri);
  }

  public has(uri: string) {
    let index = uri.lastIndexOf(':');
    while (index > 0) {
      if (this.permissions.has(uri)) {
        return true;
      }
      uri = uri.substring(0, index - 1);
      index = uri.lastIndexOf(':');
    }
    return false;
  }


}

export const OrganizeRoleMap = {
  'ROOT': '系统管理员',
  'Admin': '公司管理员',
  'Student': '学生',
  'Teacher': '老师',
  'ResourceChecker': '资源审核员',
  'Company': '公司',
  'Branch': '分公司',
  'Department': '部门',
  'Group': '小组',
  'TEAM': '团队',
  'Chairman': '董事长',
  'Boss': '老板',
  'CEO': '首席执行官',
  'CFO': '首席财务官',
  'COO': '首席运营官',
  'CIO': '首席信息官',
  'CTO': '首席技术官',
  'President': '总裁',
  'Director': '总监',
  'Manager': '经理',
  'Officer': '执行官',
  'Member': '成员',
  'Consultant':'顾问',
  'User': '普通用户',
}

export const PermissionScopeMap = {
  'all': '全部',
  'company': '公司',
  'app': 'app客户端'
}


export function formatOrganizeRoleType(type: string): string {
  let result = ( OrganizeRoleMap as any)[type];
  if (result) return result;
  return OrganizeRoleMap["User"];
}

export function formatPermissionScope(type: string): string {
  let result = (PermissionScopeMap as any)[type];
  if (result) return result;
  return PermissionScopeMap['all'];
}

export function stopEvent(e: any) {
  e = e || window.event;
  if (e.stopPropagation) { //W3C 阻止冒泡方法
    e.stopPropagation();
  } else {
    e.cancelBubble = true; //IE 阻止冒泡方法
  }
  if (e.preventDefault) { //W3C方法
    e.preventDefault();
  } else {                //IE方法
    e.returnValue = false;
  }
}
