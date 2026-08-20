import { Component, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { animate, stagger } from 'animejs';
import { AnimateOnScrollDirective } from '../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-navbar-landing',
  imports: [],
  templateUrl: './navbar-landing.html',
  styleUrl: './navbar-landing.css',
})
export class NavbarLanding {
  @ViewChild('navRef') navRef!: ElementRef;

  @HostListener('window:scroll')
  onScroll() {
    const nav = this.navRef?.nativeElement;
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }
  }
}
