import { Routes } from '@angular/router';
import {AuthWebGuard} from "../Guard/auth.web.guard";
import {LoginWebGuard} from "../Guard/login.web.guard";
// import {AuthWebGuard1, LoginWebGuard1} from "./app.config"  ;
import {InjectionToken} from "@angular/core";
import {UserService} from "../services/user.service";
export const  UserService1  = new InjectionToken<UserService>('UserService')
export const  AuthWebGuard1 = new InjectionToken<AuthWebGuard>('AuthWebGuard')
export const  LoginWebGuard1 = new InjectionToken<LoginWebGuard>('LoginWebGuard')
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../../src/pages/login.web/login.web.component')
      .then(m => m.LoginWebComponent),
    title: 'xpa builder',
    canActivate: [LoginWebGuard1],
  },
  {
    path: 'editor',
    loadComponent: () => import('../../src/components/script-editor/script-editor.component')
      .then(m => m.ScriptEditorComponent),
    title: 'merkaba',
    canActivate: [AuthWebGuard1],
  }
];
