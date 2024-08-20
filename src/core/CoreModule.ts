import {StoreUtil} from "./utils/StoreUtil";

/**
 * 核心模块 - 承载一些配置的注册与获取
 * 在主模块进行调用以供全局使用
 */
export class CoreModule {
  /**
   * 注册模块
   */
  public static register(key:string,config:any) {
    try{
      StoreUtil.set(`CoreModule-${key}`,config);
    }
    catch (e){
      console.warn("[CoreModule]register error:",e)
    }
  }

  /**
   * 注册到一个大对象中 所以最好每个对象有自己的名字 这样可以覆盖相同项
   * @param key
   * @param config
   */
  public static registerIn(key:string,config:any) {
    try{
      let has = StoreUtil.get(`CoreModule-${key}`)??{};
      StoreUtil.set(`CoreModule-${key}`,Object.assign(has,config));
    }
    catch (e){
      console.warn("[CoreModule]register error:",e)
    }
  }


  /**
   * 获取配置
   * @param key
   */
  public static getConfig(key:string){
    try{
      return StoreUtil.get(`CoreModule-${key}`);
    }
    catch (e){
      console.warn("[CoreModule]get error:",e)
    }
  }
}
