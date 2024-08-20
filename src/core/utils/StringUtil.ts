import {ObjectU} from "./ObjectUtil";
import {Buffer} from "buffer";

export class StringUtil {
    public isEmpty(v: string): boolean {
        return v == undefined || v.length == 0;
    }

    public isEmptyId(value: string): boolean {
        return !value || value == "0" || value.length == 0;
    }

    public createId(): string {
        var d = new Date().getTime();
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    }

    public encode64(content: string): any {
        let encoder = new Buffer(content).toString("base64");
        return encoder;
    }

    public decode64(content: string): any {
        let decoder = new Buffer(content, "base64").toString();
        return decoder;
    }

    public startWith(str: string, prefix: string): boolean {
        let reg = new RegExp("^" + prefix);
        return reg.test(str);
    }

    public endWith(str: string, suffix: string): boolean {
        let reg = new RegExp(suffix + "$");
        return reg.test(str);
    }

    public toArray(text: string, seperator: string) {
        if (ObjectU.isEmpty(text)) return [];
        return text.split(seperator);
    }

    public joinArray(items: Array<any>, token: string) {
        let buf = [];
        for (let i = 0; i < items.length; i++) {
            buf.push(items[i]);
        }
        return buf.join(token);
    }

    public ensureArray(param: any): any {
        if (ObjectU.isNull(param)) return [];
        if (!(param instanceof Array)) {
            return [param];
        }
        return param;
    }

    public push(items: Array<any>, value: string) {
        for (let i = 0; i < items.length; i++) {
            if (items[i] == value) return;
        }
        items.push(value);
    }

    // public pop(items: Array<any>, value: string) {
    //     let index = -1;
    //     for (let i = 0; i < items.length; i++) {
    //         if (items[i] == value) {
    //             index = i;
    //             break;
    //         }
    //     }
    //     if (index == -1) return;
    //     items.splice(index, 1);
    // }

    public pop(items: Array<any>, value: string){
        items.filter(item => item !== value)
    }

    public br(content: string): string {
        return content.replace("/\n/g", "<br>");
    }

    public trim(content: string, maxlength: number) {
        if (content.length >= maxlength) {
            return content.slice(0, maxlength);
        }
        return content;
    }

    private pad4(num: number): string {
        let ret: string = num.toString(16);
        while (ret.length < 4) {
            ret = "0" + ret;
        }
        return ret;
    }

    private random4(): string {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    public UUID(): string {
        if (typeof window.crypto !== "undefined" && typeof window.crypto.getRandomValues !== "undefined") {
            let buf: Uint16Array = new Uint16Array(8);
            window.crypto.getRandomValues(buf);
            return this.pad4(buf[0]) + this.pad4(buf[1]) + this.pad4(buf[2]) + this.pad4(buf[3]) + this.pad4(buf[4]) + this.pad4(buf[5]) + this.pad4(buf[6]) + this.pad4(buf[7]);
        } else {
            return this.random4() + this.random4() + this.random4() + this.random4() + this.random4() + this.random4() + this.random4() + this.random4();
        }
    }

    public idBy(event: any): string|null {
        let target = event.target || event.currentTarget;
        if (!target) return null;
        return target.id;
    }

    public valueBy(event: any): string|null {
        let target = event.target || event.currentTarget;
        if (!target) return null;
        return target.value;
    }

    public abbreviate(str: string, maxWidth: number): string {
        if (str.length <= maxWidth) return str;
        return str.substr(0, maxWidth) + "...";
    }

    public fileExt(name: string) {
        return name.substring(name.lastIndexOf(".") + 1);
    }

    public fileName(path: string): string {
        return path.replace(/\/+$/, "").replace(/.*\//, "");
    }

    /**
     * 提取非负数字
     * @param str
     */
    public getNumber(str:string) {
        if (!str) return 0;
        if (typeof str == "number") return str;
        let nums=str.match(/\d+(\.\d)?/g);
        let num = nums?Number(nums[0]):0;
        return isNaN(num) ? 0 : num;
    }

  /**
   * 生成任意长度的随机字符串
   * @param length
   */
  generateRandomString(length: number = 24): string {
    const letters: string = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result: string = '';
    for (let i = 0; i < length; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
  }

  /**
   * 判断是不是base64
   * @param str
   */
  isBase64(str:string){
    const notBase64 = /[^A-Z0-9+\/=]/i;
      const len = str.length;
      if (!len || len % 4 !== 0 || notBase64.test(str)) {
        return false;
      }
      const firstPaddingChar = str.indexOf('=');
      return firstPaddingChar === -1 ||
        firstPaddingChar === len - 1 ||
        (firstPaddingChar === len - 2 && str[len - 1] === '=');
  }

  /**
   * 大写首字母
   * @param str
   */
  capitalize(str:string){
    if(!str)return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}

export const StringU = new StringUtil();
