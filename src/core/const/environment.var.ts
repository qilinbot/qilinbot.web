import {InjectionToken} from "@angular/core";


/*webConfig对应本地的environment.ts文件*/
export interface IEnvironmentConfig {
  isProduction: boolean;
  siteName: string;
  appType: string;
  appVersion: string;
  restHost: string;
  envType?: string;
}

export const AppConfig = new InjectionToken<IEnvironmentConfig>("AppConfig")

// 设备类型
export enum Device {
  h5,
  wechat,
  desktop,
  mac,
  win,
  linux,
  web,
  ios,
  android
}

// 设备模式
export enum DeviceModel {
  default = 0,
  iPhonex = 1,
  note8 = 2
}

// 运行环境
export enum RunMode {
  Browser = 0,
  NodeJS = 1,
  Mobile = 2
}
