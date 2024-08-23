import { Injectable } from '@angular/core';
import {HttpService} from "../core/http.service";

@Injectable({
  providedIn: 'root'
})
export class CodeDeclareService {
  constructor(private http: HttpService) {
  }

  /**
   * 读取代码的声明
   * @param id
   */
  readDeclare(id: string = 'default'){
    return this.http.post('Merkaba/readDoc', {id});
  }

  /**
   * 更新代码的声明
   * @param id
   * @param content
   */
  updateDeclare(id: string, content: string){
    return this.http.post('Merkaba/updateDoc', {id, content});
  }
}
