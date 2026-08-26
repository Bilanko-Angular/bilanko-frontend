// src/app/pages/landing/components/landing-features/landing-features.component.ts

import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-landing-features',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './landing-features.html',
  styleUrls: ['./landing-features.css']
})
export class LandingFeatures {}