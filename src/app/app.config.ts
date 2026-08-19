import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Importation des données de localisation pour le français
import registerFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';

// Enregistrement de la locale fr-FR
registerLocaleData(registerFr, 'fr-FR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // Configuration du pipe number pour utiliser le format français par défaut
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
};