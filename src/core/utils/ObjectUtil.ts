import {Injectable} from "@angular/core";

export type FieldsArray = Array<Partial<Record<'field' | 'oldValue' | 'newValue', any>>>;

@Injectable({
  providedIn: 'root'
})
export class ObjectUtil {
  /**
   * 是否存在
   * @param obj
   */
  public isPresent(obj: any): boolean {
    return obj !== undefined && obj !== null;
  }

  /**
   * 是否为string类型
   * @param obj
   */
  public isString(obj: any): boolean {
    return typeof obj === 'string';
  }

  /**
   * 是否为函数对象
   * @param value
   */
  public isFunction(value: any) {
    return typeof value === 'function';
  }

  /**
   * 是否为对象
   * @param obj
   */
  public isObject(obj: any) {
    return typeof obj === 'object';
  }

  /**
   * 是否只为对象
   * @param obj
   */
  public isOnlyObject(obj: any) {
    if (obj === null || obj === undefined) return false;
    return obj.constructor === Object;
  }

  /**
   * 是否为类数组
   * @param obj
   */
  public likeArray(obj: any) {
    return typeof obj.length == 'number';
  }

  /**
   * 是否为数组
   * @param arr
   */
  public isArray(arr: any) {
    return Array.isArray(arr) || Object.prototype.toString.apply(arr) === '[object Array]';
  }

  /**
   * 是否为扁平化对象
   * @param obj
   */
  public isPlainObject(obj: any) {
    return this.isObject(obj) && obj !== null && obj !== obj.window && Object.getPrototypeOf(obj) == Object.prototype;
  }

  /**
   * 对象赋值
   * @param source
   * @param dest
   */
  public assign(source: any, dest: any) {
    for (let key in source) {
      if (!dest.hasOwnProperty(key)) continue;
      dest[key] = source[key];
    }
  }

  /**
   * source对象继承dest对象属性
   * @param dest
   * @param source
   */
  public extend(dest: any, source: any): any {
    let result: any = {};
    result = Object.assign(result, dest);
    result = Object.assign(result, source);
    return result;
  }

  /**
   * 深拷贝-普通的版本-太深会引发栈溢出
   * @param source 源对象
   * @logs
   * 1.添加类型描述  wh-23.2.17 17:36
   * @author wh131462
   * @time 2023年02月17日17:37:28
   */
  public clone(source: Object) {
    if (!(source instanceof Object)) return source;
    return JSON.parse(JSON.stringify(source));
  }

  /**
   * 完全克隆 函数不会丢失
   * @param source
   */
  public cloneFull(source: any) {
    let copy: any;

    // Handle the 3 simple types, and null or undefined
    if (null == source || "object" != typeof source) return source;

    // Handle Date
    if (source instanceof Date) {
      copy = new Date();
      copy.setTime(source.getTime());
      return copy;
    }

    // Handle Array
    if (source instanceof Array) {
      copy = [];
      for (let i = 0, len = source.length; i < len; i++) {
        copy[i] = this.cloneFull(source[i]);
      }
      return copy;
    }

    // Handle Object
    if (source instanceof Object) {
      copy = {};
      for (const attr in source) {
        if (source.hasOwnProperty(attr)) copy[attr] = this.cloneFull(source[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy values! Its type isn't supported.");
  }

  /**
   * 转布尔值
   * @param val
   */
  public toBool(val: any): boolean {
    return val != null && `${val}` !== 'false';
  }

  /**
   * 是否为null
   * @param param
   */
  public isNull(param: any): boolean {
    let b = param === undefined || param == null;
    b = b || (param instanceof String && param.length == 0);
    return b;
  }

  /**
   * 对象是否为空
   * @param param
   */
  public isEmpty(param: any): boolean {
    let b = this.isNull(param);
    if (b) return b;
    return param.length == 0;
  }

  /**
   * 复制字段
   * @param from
   * @param to
   * @param fields
   */
  public copyFields(from: any, to: any, fields: Array<string>) {
    for (let i = 0; i < fields.length; i++) {
      let name = fields[i];
      if (from[name] == undefined) continue;
      to[name] = from[name];
    }
  }

  /**
   * 对象去除所有的undefined
   * @param obj
   * @param prefix
   */
  public clearUndefined(obj: any, depth: number = 1, prefix?: string) {
    for (let key in obj) {
      if (obj[key] == undefined) {
        delete obj[key];
      } else if (prefix != undefined && key.startsWith(prefix)) {
        delete obj[key];
      } else if (obj[key] instanceof Object && --depth > 0) {
        obj[key] = this.clearUndefined(obj[key], depth)
      }
    }
    return obj;
  }

  /**
   * 去除指定字段
   * @param obj
   * @param fieldName
   */
  public removeField(obj: any, fieldName: string) {
    delete obj[fieldName];
  }

  /**
   * 去除指定字段列表
   * @param obj
   * @param fieldNames
   */
  public removeFields(obj: any, fieldNames: string[]) {
    fieldNames.forEach((i) => delete obj[i]);
  }

  /**
   * 数组添加全部元素
   * @param dests
   * @param items
   */
  public pushAll(dests: Array<any>, items: Array<any>) {
    dests.push(...items)
  }

  /**
   * 从数组复制
   * @param dests
   * @param items
   */
  public copyFrom(dests: Array<any>, items: any) {
    for (let i = 0; i < items.length; i++) {
      dests.push(items[i]);
    }
  }

  /**
   * 根据指定长度 返回数字数组
   * @param size
   */
  public numberArray(size: number): Array<number> {
    let result: Array<number> = new Array();
    for (let i = 0; i < size; i++) {
      result.push(i);
    }
    return result;
  }

  /**
   * 拖放
   * @param items
   * @param dragIndex
   * @param dropIndex
   */
  public dragDrop(items: Array<any>, dragIndex: number, dropIndex: number) {
    if (dragIndex === null && dropIndex === null) return "";
    let results: Array<any> = [];
    let saveIndex: number = Math.min(dragIndex, dropIndex);
    let saveItem: any;
    for (let i = 0; i < saveIndex; i++) {
      if (i == dragIndex) continue;
      saveItem = items[i];
      results.push(saveItem);
    }

    let saveSeq = saveItem ? saveItem['seq'] : 1;
    for (let i = saveIndex; i < items.length; i++) {
      if (i == dragIndex) continue;
      if (dragIndex > dropIndex) {
        if (i == dropIndex) {
          saveItem = items[dragIndex];
          results.push(saveItem);
          saveItem['seq'] = saveSeq++;
        }
        saveItem = items[i];
        results.push(saveItem);
        saveItem['seq'] = saveSeq++;
      } else {
        saveItem = items[i];
        results.push(saveItem);
        saveItem['seq'] = saveSeq++;

        if (i == dropIndex) {
          saveItem = items[dragIndex];
          results.push(saveItem);
          saveItem['seq'] = saveSeq++;
        }
      }
    }
    return results;
  }

  /**
   * 去除指定seq
   * @param items
   * @param index
   */
  public removeSeq(items: Array<any>, index: number) {
    if (index == null) return;
    let oItem: any = items[index];
    let seqIndex: number = oItem['seq'];
    items.splice(index, 1);
    if (seqIndex == undefined) return;
    for (let i = index; i < items.length; i++) {
      items[i]['seq'] = seqIndex++;
    }
  }

  /**
   * 从指定item开始删除
   * @param items
   * @param item
   */
  public removeFrom(items: Array<any>, item: any) {
    let index: number = items.indexOf(item);
    if (index < 0) return;
    items.splice(index, 1);
  }

  /*找到这个节点对应的公司父节点*/
  public lookupCompanyNode(dataMap: any, node: any): any {
    if (node == undefined) return null;
    let parentId = node.parentId;
    if (parentId == undefined || parentId.length == 0) return null;
    let parentNode = dataMap.get(parentId);
    if (parentNode == null) return null;
    if (parentNode.type == 'Company') return parentNode;
    return this.lookupCompanyNode(dataMap, parentNode);
  }

  /**
   * 对象数组去重
   * @param arr 对象数组
   * @param Key 可选参数 指定key
   * @param strict 严格比较 如果不严格比较 key给出就只要有相同的key就会过滤
   */
  public deduplicateObjectArray(arr: Array<Object>, Key?: string, strict?: boolean) {
    let newArr: any = [];
    //对象数组去重
    arr.forEach((item: any) => {
      let key = Key ?? Object.getOwnPropertyNames(item)[0];
      let existObjs = newArr?.filter((i: any) => item[key] == i[key]);
      let index = existObjs?.findIndex((existObj: any) => {
        if (strict) {
          return this.compare(item, existObj)
        } else {
          return item[key] == existObj[key];
        }
      });
      if (index == -1 || index == undefined) {
        newArr.push(item);
      }
    })
    return newArr;
  }

  /**
   * 数组去重
   * @param arr
   * @returns
   */
  public deduplicateArray(arr: Array<any>) {
    return [...new Set(arr)];
  }

  /**
   * 返回一个键值排序后的新对象
   */
  public sortObjectKeys(obj: Record<string, any>) {
    return Object.keys(obj).sort().reduce((newObj: Record<string, any>, key: string) => {
      if (typeof obj[key] === 'object') {
        newObj[key] = Array.isArray(obj[key]) ?
          obj[key].map((o: any) => typeof o == 'object' ? this.sortObjectKeys(o) : o) :
          this.sortObjectKeys(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
      return newObj;
    }, {})
  }

  /**
   * 比较对象字符串对象实现简单比较
   * @param o1
   * @param o2
   */
  public compareObjectByString(o1: Record<string, any>, o2: Record<string, any>) {
    try {
      return JSON.stringify(this.sortObjectKeys(o1)) === JSON.stringify(this.sortObjectKeys(o2));
    } catch (e) {
      return false;
    }
  }

  /**
   * 工具函数 compare 判别标准:对比两个对象 对象的属性相同 那么对象就是相同
   */
  public compare(obj1: any, obj2: any): boolean {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
      return obj1 === obj2;
    }
    //DISABLE console.log("正在对比",obj1,obj2)
    let keys = Object.keys(obj1);
    let keysOther = Object.keys(obj2);
    if (keys.length != keysOther.length) {
      //DISABLE console.log('false from keys length')
      return false;
    }
    for (let key of keys) {
      if (typeof obj1[key] === 'object') {
        if (!this.compare(obj1[key], obj2[key])) {
          //DISABLE console.log("false from obj",key,obj1[key], obj2[key])
          return false;
        }
      } else if (obj1[key] != obj2[key]) {
        //DISABLE console.log("false from val",key,obj1[key],obj2[key])
        return false;
      }
    }
    //对比完成
    return true;
  }

  /**
   * 比较对象是否按keys都相等
   * @param objs
   * @param keys
   */
  public compareObjects(objs: Object[], keys: string[]): boolean {
    if (objs.length < 2) return true;
    let tempArr = objs.map((item: any) => {
      return keys.map((key): any => item[key]);
    });
    for (let i = 0; i < tempArr.length - 1; i++) {
      if (!this.compare(tempArr[i], tempArr[i + 1])) {
        return false;
      }
      if (i + 1 == tempArr.length - 1) break;
    }
    return true;
  }

  /**
   *  数组去重
   */
  public arrayRemoveSameKey(arr: Array<any>, key: string): Array<any> {
    const res = new Map();
    return arr.filter((item) => !res.has(item[key]) && res.set(item[key], 1));
  }

  deTimer: any = null;

  /**
   * 防抖 只执行最后一次
   * @param func
   * @param wait
   */
  public debounce(func: Function, wait = 300) {
    if (this.deTimer) clearInterval(this.deTimer)
    this.deTimer = window.setTimeout(() => {
      func()
    }, wait);
  }

  timer: any = null;
  /**
   * 节流函数 点击之后一段时间不会再触发
   * @param fn
   * @param still 持续间隔时间
   */
  public throttle = (fn: Function, still = 300) => {
    if (!this.timer) {
      fn();
      this.timer = setTimeout(() => {
        if (this.timer) clearInterval(this.timer)
        this.timer = null;
      }, still);
    }
  }

  /**
   * 按shape过滤source对象，并返回一个过滤后的对象
   * @param source
   * @param shape
   */
  public filterObject(source: any, shape: any) {
    let o: any = {};
    if (Array.isArray(source)) {
      o = this.clone(source)
      source.forEach(item => {
        Object.keys(shape).forEach(key => {
          if (item[key] !== undefined ||
            item[key] !== null) {
            o[key] = item[key];
          }
        });
      })
    } else {
      Object.keys(shape).forEach(key => {
        if (source[key] !== undefined ||
          source[key] !== null) {
          o[key] = source[key];
        }
      });
    }

    //DISABLE console.log('过滤',source,shape,o)
    return o;
  }

  /**
   * 模拟鼠标触发事件
   * @param event
   * @param target
   */
  public eventSimulate(event: 'click' | 'mouseenter' | 'mousedown' | 'mouseup' = 'click', target: any) {
    return new Promise(resolve => {
      if (!target) target = document.body;
      if (document.all) {
        //IE
        target[event]();
      } else {
        //other
        let events = document.createEvent('MouseEvents')
        events.initEvent(event, true, true);
        target.dispatchEvent(events);
      }
      resolve(true);
    })

  }

  /**
   * 正则表达式字符串转正则对象
   * @param reg
   */
  regStringToObject(reg: string | RegExp) {
    if (reg instanceof RegExp) {
      return reg;
    } else if (typeof reg == "string") {
      let mode = reg.match(/\/[a-zA-Z]+/g)?.join('').replace('/', '');
      let str = reg.replace(/\/[a-zA-Z]*$/g, '').replace(/\//g, '')
      return new RegExp(str, mode);
    } else {
      console.error(`Error:输入非正则字符串！${reg}`)
      return;
    }
  }

  /**
   * 传入的值中存在定义
   */
  isValue(...rest: any[]): boolean {
    return !!(rest.length && rest.every(v => v !== null && v !== undefined));
  }

  /**
   * 加密 规则固定 不能用于后端数据加密 只能用于前端的浅层加密 并且无法解密
   * @param origin
   */
  encrypt(origin: any): string {
    origin = origin.toString();
    const alphabet: string = this.getAlphabet() + this.getAlphabet(true);
    let encryptedStr: string = '';
    for (let i: number = 0; i < origin.length; i++) {
      const char = origin[i];
      const charCode = char.charCodeAt(0);
      const index: number = charCode % alphabet.length;
      const encryptedChar: string = alphabet[index];
      encryptedStr += encryptedChar;
    }
    return encryptedStr;
  }

  /**
   * 获取字母表 - 大写
   */
  getAlphabet(low: boolean = false) {
    let characters = '';
    for (let i = 65; i <= 90; i++) {
      characters += String.fromCharCode(i);
    }
    return low ? characters.toLowerCase() : characters;
  }

  /**
   * 获取一个新对象拥有指定的字段
   * @param origin
   * @param fields
   */
  objectWithFields<T>(origin: T, fields: Array<keyof T>) {
    fields = fields || [];
    return fields.reduce((previousValue: T, currentValue: keyof T) => {
      previousValue[currentValue] = origin[currentValue];
      return previousValue;
    }, Object.create(null))
  }

  /**
   * 获取一个新对象拥有指定的字段
   * @param origin
   * @param fields
   */
  objectExcludeFields<T>(origin: T, fields: Array<keyof T>) {
    fields = fields || [];
    return fields.reduce((previousValue: T, currentValue: keyof T) => {
      delete previousValue[currentValue];
      return previousValue;
    }, {...origin})
  }

  /**
   * 安全转化字符串到对象
   * @param message
   */
  safeStringToObject(message: any): any {
    let obj: any = {};
    try {
      obj = JSON.parse(message);
    } catch (e) {
      if (typeof message == "string") {
        return message;
      }
    }
    return obj;
  }

  /**
   * 数字转字母表示法
   * @param num
   */
  numberToAlphabeticalNotation(num: number) {
    if (num <= 0) {
      return "";
    }
    const base = 26; // 字母表中的基数
    const letters = this.getAlphabet(true); // 字母表
    let result = "";
    while (num > 0) {
      const remainder = (num - 1) % base; // 计算余数
      result = letters[remainder] + result; // 将字母添加到结果的开头
      num = Math.floor((num - 1) / base); // 更新数字
    }
    return result;
  }

  /**
   * 整数到罗马数字
   * @param num
   */
  intToRoman(num: number) {
    const romanNumerals = {
      "M": 1000,
      "CM": 900,
      "D": 500,
      "CD": 400,
      "C": 100,
      "XC": 90,
      "L": 50,
      "XL": 40,
      "X": 10,
      "IX": 9,
      "V": 5,
      "IV": 4,
      "I": 1
    };

    let result = "";

    for (const [symbol, value] of Object.entries(romanNumerals)) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  }

  /**
   * 获取全局唯一的id
   */
  public getUuid(namespace?: string) {
    const timestamp = Date.now();
    const alphabet = this.getAlphabet() + this.getAlphabet(true); // 包含英文字母的字符串
    let randomLetters = '';
    // 生成随机的字母序列，这里生成了 4 个字母
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      randomLetters += alphabet[randomIndex];
    }
    // 将时间戳转换为字符串
    const timestampStr = timestamp.toString();
    // 创建一个空字符串用于构建最终的UUID
    let uuid = "";
    // 在数字的0,2,4,6下标插入随机字符
    for (let i = 0; i < timestampStr.length; i++) {
      if (i % 2 === 0) {
        uuid += randomLetters.charAt(i / 2); // 插入随机字母
      }
      uuid += timestampStr.charAt(i); // 插入时间戳的数字
    }
    // 添加可能存在的namespace
    uuid = `${namespace ?? ""}${uuid}`;
    // 确保首位是字母
    if (/^\d/.test(uuid)) {
      const firstLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      uuid = firstLetter + uuid.slice(1);
    }
    return uuid;
  }

  /**
   * 树结构转扁平化结构 - 可指定转化的字段对象
   * @param tree
   * @param specifyFields
   */
  treeToFlat(tree: Array<any>, specifyFields: Record<"id" | "children" | "parentId", string> = {
    id: "id",
    children: "children",
    parentId: "parentId"
  }): Array<any> {
    if (!tree.length) return [];
    const flattenTree = (item: any, parent: any) => {
      const children = item[specifyFields.children];
      delete item[specifyFields.children];
      return [
        {...item, ...(parent ? {[specifyFields.parentId]: parent} : undefined)},
        ...(children?.length ?
          children.flatMap((n: any) => flattenTree(n, item[specifyFields.id])) :
          [])
      ];
    }
    return tree.flatMap(flattenTree)
  }

  /**
   * 扁平化转树结构 - 可指定转化的字段对象
   * @param flat
   * @param specifyFields
   */
  flatToTree(flat: Array<any>, specifyFields: Record<"id" | "children" | "parentId", string> = {
    id: "id",
    children: "children",
    parentId: "parentId"
  }): Array<any> {
    const map = new Map();
    const roots: Node[] = [];

    flat.forEach((item) => {
      map.set(item[specifyFields.id], {...item, [specifyFields.children]: []});
    });

    flat.forEach((item) => {
      const node = map.get(item[specifyFields.id]);
      if (item[specifyFields.parentId]) {
        const parent = map.get(item[specifyFields.parentId]);
        if (parent) {
          delete node[specifyFields.parentId];
          parent[specifyFields.children].push(node);
        }
      } else {
        delete node[specifyFields.parentId];
        roots.push(node);
      }
    });
    return roots;
  }

  /**
   * 返回任意对象的类型 - null=>null undefined=>undefined
   * @param target
   */
  getDataType(target: any) {
    let type = typeof target
    if (type === 'object') {
      return Object.prototype.toString.call(target).replace(/^\[object\s(\S+)]$/, '$1').toLowerCase();
    } else {
      return type;
    }
  }

  /**
   * 获取新旧值对比的差异
   * 也可以获取两个对象中删除的字段和添加的字段
   */
  getDiffFields(source: Record<string, any>, target: Record<string, any>) {
    const sourceKeys = Object.getOwnPropertyNames(source);
    const targetKeys = Object.getOwnPropertyNames(target);

    const deleteKeys = sourceKeys.filter(key => !targetKeys.includes(key)).reduce((acc: FieldsArray, key) => {
      return [...acc, {field: key, oldValue: source[key]}]
    }, []);
    const additionKeys = targetKeys.filter(key => !sourceKeys.includes(key)).reduce((acc: FieldsArray, key) => {
      return [...acc, {field: key, newValue: target[key]}]
    }, []);

    const updateCheckKeys = sourceKeys.filter(key => targetKeys.includes(key));
    const updateKeys:FieldsArray = updateCheckKeys.filter(key => !this.compare(source[key], target[key])).reduce((acc: FieldsArray, key) => {
      return [...acc, {field: key, oldValue: source[key], newValue: target[key]}]
    }, []);
    return {
      deleteFields: deleteKeys,
      addFields: additionKeys,
      updateFields: updateKeys
    }
  }

}

export const ObjectU = new ObjectUtil();
