import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { animate,stagger } from 'animejs';
import { AnimateOnScrollDirective } from '../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-hero',
  imports: [AnimateOnScrollDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('heroVisual') heroVisual!: ElementRef;

  ngAfterViewInit() {
    // Animation séquentielle des barres du graphique avec AnimeJS
    const bars = this.chartContainer.nativeElement.querySelectorAll('.chart-bar');
    animate(bars, {
      scaleY: [0, 1],
      opacity: [0, 1],
      delay: stagger(120, { start: 300 }),
      duration: 600,
      ease: 'outBack',
    });

    // Animation de flottement continu du visual hero
    animate(this.heroVisual.nativeElement, {
      translateY: [-6, 6],
      duration: 3000,
      direction: 'alternate',
      loop: true,
      ease: 'easeInOutSine'
    });
  }
}