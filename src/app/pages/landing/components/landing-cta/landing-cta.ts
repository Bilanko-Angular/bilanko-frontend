// src/app/pages/landing/components/landing-cta/landing-cta.component.ts

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-landing-cta',
  standalone: true,
  imports: [RouterLink, AnimateOnScrollDirective],
  templateUrl: './landing-cta.html',
  styleUrls: ['./landing-cta.css']
})
export class LandingCta {}