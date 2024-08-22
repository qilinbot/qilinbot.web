import {Inject, Injectable} from '@angular/core';
import { Router } from '@angular/router';
import {AppContext} from "../core/const/context.var";
import {ContextService} from "../core/context.service";

@Injectable()
export class LoginWebGuard  {
    constructor(@Inject(AppContext) public ctx: ContextService,
        public router: Router) {
    }

    public canActivate() {
        console.log(this.getCookie('cookieId'));
        // if(this.getCookie('cookieId')) {
        return true
    }

    public getCookie(name:any) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

        if(arr=document.cookie.match(reg)) return unescape(arr[2]);
        else return null;
    }
}
