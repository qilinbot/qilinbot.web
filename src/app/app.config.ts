import {APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection} from '@angular/core';
import {ActivatedRoute, provideRouter} from '@angular/router';

import { routes } from './app.routes';
import {AppContext, AppEnv, RouteData} from "../core/const/context.var";
import {ContextService} from "../core/context.service";
import {EnvironmentService} from "../core/environment.service";
import {Environment} from "../environments/environment";
import {AppConfig} from "../core/const/environment.var";
import { provideHttpClient} from "@angular/common/http";

export function initializeApp() {
  let ctx = inject(AppContext);
  let env = inject(AppEnv);
  return () => new Promise<any>(resolve => {
    env.initDevice();
    // ctx.init();
    let oHttp = env.initAuth(location.protocol)//location.protocol ||
    oHttp.subscribe({
      next: (resp) => {
        console.log(resp);
        ctx.fillContext(resp);
        ctx.env.fillDomain(resp);
        resolve(true);
      },
      error: (e) => {
        console.log(e);
        resolve(false);
      }
    });
  });
}

// 现在都是采用方法注册进来
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: AppConfig, useValue: Environment },
    { provide: AppContext, useClass: ContextService },
    { provide: AppEnv, useClass: EnvironmentService },
    { provide: RouteData, useValue: ActivatedRoute },
    provideHttpClient(), // 注册 HttpClient
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppContext, AppEnv],
      multi: true
    },
  ],
};

