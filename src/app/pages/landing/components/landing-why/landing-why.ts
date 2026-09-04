// src/app/pages/landing/components/landing-why/landing-why.component.ts

import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-landing-why',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './landing-why.html',
  styleUrls: ['./landing-why.css']
})
export class LandingWhy {}