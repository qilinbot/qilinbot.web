import {
  APP_INITIALIZER,
  importProvidersFrom,
  inject,
  provideZoneChangeDetection
} from '@angular/core';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {AppContext, AppEnv, RouteData} from "../core/const/context.var";
import {ContextService} from "../core/context.service";
import {EnvironmentService} from "../core/environment.service";
import {Environment} from "../environments/environment";
import {AppConfig} from "../core/const/environment.var";
import { provideHttpClient} from "@angular/common/http";
import {AuthWebGuard} from "../Guard/auth.web.guard";
import {LoginWebGuard} from "../Guard/login.web.guard";
import {UserService} from "../services/user.service";
import {routes} from "./app.routes";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";


export function initializeApp() {
  let ctx = inject(AppContext);
  let env = inject(AppEnv);
  console.log(env)
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

export const appConfig = {
  providers: [
    importProvidersFrom([BrowserAnimationsModule]),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: AppConfig, useValue: Environment },
    { provide: AppContext, useClass: ContextService },
    { provide: AppEnv, useClass: EnvironmentService },
    { provide: RouteData, useValue: ActivatedRoute },
    UserService,
    AuthWebGuard,
    LoginWebGuard,
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppContext, AppEnv],
      multi: true
    },
  ],
};

