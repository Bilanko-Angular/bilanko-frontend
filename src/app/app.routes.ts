import { Routes } from '@angular/router';
import { Acceuil} from './pages/acceuil/acceuil';
import { CatalogueStocks } from './pages/catalogue-stocks/catalogue-stocks';
// import { BanqueFiscaliteComponent } from './pages/banque-fiscalite/banque-fiscalite.component';

export const routes: Routes = [
  { path: '', component: Acceuil },
  // routes de tes collègues (ventes, charges, documents...)
  { path: 'catalogue', component: CatalogueStocks},
  // { path: 'banque-fiscalite', component: BanqueFiscaliteComponent },
];