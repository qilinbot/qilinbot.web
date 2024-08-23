import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from "../core/http.service";

@Injectable({
  providedIn:"root"
})
export class DataService {

    constructor(public http: HttpService) {}

    load(params): Observable<any> {
        return this.http.post('/DataTable/load', params)
    }

    read(params): Observable<any> {
        return this.http.post('/DataTable/read', params);
    }

    update(params): Observable<any> {
        return this.http.post('/DataTable/update', params);
    }

    remove(params): Observable<any> {
        return this.http.post('/DataTable/remove', params);
    }

    /**
     * 根据id加载某条数据
     */
    public readItems(params) {
        return this.http.post('/DataTable/readItems', params)
    }

    /**
     * search
     * 获取搜索下拉列表
     */
    getSelect(params) {
        return this.http.post('/DB/lookup', params)
    }

    /**
     * 输入搜索产品
     */
    getProduct(params) {
        return this.http.post('/Goods/query', params)
    }

    /**
     * search
     * @param params
     */
    search(params) {
        return this.http.post('/DB/search', params)
    }

    searchTree(params) {
        return this.http.post('/DB/treeSearch', params)
    }

    /**
     * 加载表单
     * @param params
     */
    public loadForm(params) {
        return this.http.post('/DataForm/read', params);
    }

  /**
   * 加载表单
   * @param params
   */
  public initForm(params) {
    return this.http.post('/DataForm/init', params);
  }

    /**
     * 读取日志
     */
    public readLogs(params) {
        return this.http.post('/DataTable/readLogs', params)
    }

    /**
     * 读取下拉数据
     */
    public createForm(params) {
        return this.http.post('/DataTable/createForm', params)
    }

    /**
     * 读取公司列表
     * @param params
     */
    loadCompany(params) {
        return this.http.post('/Company/load', params);
    }

    /**
     * 更新公司信息
     * @param params
     */
    updateCompany(params) {
        return this.http.post('/Company/update', params);
    }

    /**
     * 删除公司
     * @param params
     */
    removeCompany(params) {
        return this.http.post('/Company/remove', params);
    }
    /**
     * 读取公司信息
     * @param params
     */
    readCompany(params) {
        return this.http.post('/Company/read', params);
    }

    /**
     * 库存预警
     */
    loadInventoryAlert() {
        return this.http.post('/InventoryAlert/load', { "offset": 0, "pageSize": 3 })
    }

    updateInventoryAlert(params) {
        return this.http.post('/InventoryAlert/update', params)
    }

    createFormInventoryAlert() {
        return this.http.post('/InventoryAlert/createForm')
    }

}
