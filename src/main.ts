import { inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { globalLoaderInterceptor } from './app/core/interceptors/global-loader.interceptor';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { actorInterceptor } from './app/core/interceptors/actor.interceptor';
import { AuthSessionService } from './app/core/services/auth-session.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([authInterceptor, actorInterceptor, globalLoaderInterceptor])),
    provideAppInitializer(() => inject(AuthSessionService).initialize()),
    provideRouter(routes, withComponentInputBinding())
  ]
}).catch(console.error);
