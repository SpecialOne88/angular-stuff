import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';

import { routes } from './app.routes';
import { DEFAULT_LANG_ID, DEFAULT_DATE_FORMATS, dateFnsLocale } from './utils/date-utils';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en-GB';
import localeIT from '@angular/common/locales/it';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';

registerLocaleData(localeEN);
registerLocaleData(localeIT);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideDateFnsAdapter(DEFAULT_DATE_FORMATS),
    { provide: LOCALE_ID, useValue: DEFAULT_LANG_ID },
    { provide: MAT_DATE_LOCALE, useValue: dateFnsLocale }, provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'it'],
        defaultLang: DEFAULT_LANG_ID,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader
    })
  ]
};
