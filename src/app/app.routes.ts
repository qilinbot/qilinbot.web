import { Routes } from '@angular/router';
import {AuthWebGuard} from "../Guard/auth.web.guard";
import {LoginWebGuard} from "../Guard/login.web.guard";
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../../src/pages/login.web/login.web.component')
      .then(m => m.LoginWebComponent),
    title: 'xpa builder',
    canActivate: [LoginWebGuard],
  },
  {
    path: 'editor',
    loadComponent: () => import('../../src/components/script-editor/script-editor.component')
      .then(m => m.ScriptEditorComponent),
    title: 'merkaba',
    canActivate: [AuthWebGuard],
  },
  {
    path: 'code-editor',
    loadComponent: ()=>import('../pages/code-editor/code-editor.page.component')
      .then(m => m.CodeEditorPageComponent),
    title: '代码编辑器',
  },
  {
    path: 'test',
    loadComponent: ()=>import('../components/test/test.component').then(m => m.TestComponent),
    title: '测试页面',
  }
];
