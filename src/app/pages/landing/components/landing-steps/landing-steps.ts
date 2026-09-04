// src/app/pages/landing/components/landing-steps/landing-steps.component.ts

import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-landing-steps',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './landing-steps.html',
  styleUrls: ['./landing-steps.css']
})
export class LandingSteps {}