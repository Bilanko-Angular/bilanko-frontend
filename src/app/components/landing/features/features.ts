import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../../directive/animate-on-scroll.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features',
  imports: [AnimateOnScrollDirective,CommonModule],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {
features = [
    {
      title: 'Gestion de stock',
      description: 'Ajoutez vos produits, suivez les quantités en temps réel et évitez les ruptures ou les ventes impossibles.',
      svgPath: 'M21 8l-9-5-9 5 9 5 9-5z M3 8v8l9 5 9-5V8 M12 13v8'
    },
    {
      title: 'Suivi des ventes',
      description: 'Enregistrez chaque vente en quelques secondes. Bilanko calcule votre marge automatiquement.',
      svgPath: 'M3 3v18h18 M7 15l4-5 3 3 5-7'
    },
    {
      title: 'Documents pour prêts',
      description: 'Générez en un clic vos relevés, bilans et prévisionnels au format attendu par les banques.',
      svgPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M9 15l2 2 4-4'
    }
  ];
}
