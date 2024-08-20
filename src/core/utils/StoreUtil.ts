/**
 * 存储工具 - 增强localStorage
 * @supported 支持存储函数
 */
export class StoreUtil{
  static fun_prefix = "[CORE]";
  static set(key:string,value:any){
    const store_str = JSON.stringify(value,(key,value)=>{
      if(typeof value === "function"){
        return `${StoreUtil.fun_prefix}${value}`;
      }
      return value;
    });
    localStorage.setItem(key,store_str)
  }

  static get(key:string){
    const store_str = localStorage.getItem(key);
    if(!store_str)return null;
    const parser = JSON.parse(store_str,(key, value)=>{
      if(value && typeof value === 'string') {
        return value.startsWith(StoreUtil.fun_prefix) ? new Function(`return ${value.replace(StoreUtil.fun_prefix, '')}`)() : value;
      }
      return value;
    });
    return parser;
  }

  static remove(key:string){
    localStorage.removeItem(key)
  }

  static clear(){
    localStorage.clear()
  }
}
