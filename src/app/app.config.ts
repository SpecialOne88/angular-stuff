import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection, isDevMode, provideAppInitializer, inject } from '@angular/core';
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
import { getBrowserLang, provideTransloco, TranslocoService } from '@jsverse/transloco';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { LocalizedPaginator } from './utils/localized-paginator';
import { firstValueFrom } from 'rxjs';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import AnnotationPlugin from 'chartjs-plugin-annotation';

registerLocaleData(localeEN);
registerLocaleData(localeIT);

const availableLangs = ['en', 'it'];

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
    }),
    {
      provide: MatPaginatorIntl,
      deps: [
        TranslocoService
      ],
      useFactory: (translateService: TranslocoService) => new LocalizedPaginator(translateService).getPaginatorIntl()
    },
    provideAppInitializer(() => {
      firstValueFrom(inject(TranslocoService).load(availableLangs.includes(getBrowserLang() ?? '') ? getBrowserLang()! : 'en'))
    }),
    provideCharts(withDefaultRegisterables(AnnotationPlugin))
  ]
};
