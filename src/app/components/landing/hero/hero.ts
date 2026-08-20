import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-hero',
  imports: [AnimateOnScrollDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {}