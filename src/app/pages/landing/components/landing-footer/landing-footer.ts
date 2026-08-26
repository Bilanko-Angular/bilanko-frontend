// src/app/pages/landing/components/landing-footer/landing-footer.component.ts

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [RouterLink, AnimateOnScrollDirective],
  templateUrl: './landing-footer.html',
  styleUrls: ['./landing-footer.css']
})
export class LandingFooter {
  currentYear = new Date().getFullYear();
}