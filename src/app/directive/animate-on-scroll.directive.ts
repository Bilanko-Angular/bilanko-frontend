import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';
import { animate } from 'animejs';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true,
})
export class AnimateOnScrollDirective implements AfterViewInit {
  @Input() appAnimateOnScrollDelay = 0;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.el.nativeElement.style.opacity = '0';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target as HTMLElement, {
              translateY: [35, 0],
              opacity: [0, 1],
              duration: 800,
              delay: this.appAnimateOnScrollDelay,
              ease: 'outCubic',
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(this.el.nativeElement);
  }
}