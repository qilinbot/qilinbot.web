import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../../src/pages/login.web/login.web.component').then(m => m.LoginWebComponent),
    title: 'xpa builder'
  },
  {
    path: 'editor',
    loadComponent: () => import('../../src/components/script-editor/script-editor.component').then(m => m.ScriptEditorComponent),
    title: 'merkaba',
  }
];
