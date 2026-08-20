import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScrollDirective } from '../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-how-it-works',
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
})
export class HowItWorks {
  steps = [
    { stepNumber: 1, title: 'Créez votre compte', description: 'Inscrivez votre commerce en quelques minutes, sans papier ni frais de départ.' },
    { stepNumber: 2, title: 'Ajoutez vos produits', description: 'Renseignez votre stock de départ et vos prix. Bilanko s\'occupe du reste au quotidien.' },
    { stepNumber: 3, title: 'Générez vos documents', description: 'En un clic, obtenez le relevé ou le bilan à joindre à votre demande de prêt.' }
  ];
}
