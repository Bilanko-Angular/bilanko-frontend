// src/app/pages/landing/landing.component.ts

import { Component } from '@angular/core';
import { LandingNavbar } from './components/landing-navbar/landing-navbar';
import { LandingHero } from './components/landing-hero/landing-hero';
import { LandingFeatures } from './components/landing-features/landing-features';
import { LandingWhy } from './components/landing-why/landing-why';
import { LandingSteps } from './components/landing-steps/landing-steps';
import { LandingCta } from './components/landing-cta/landing-cta';
import { LandingFooter } from './components/landing-footer/landing-footer';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    LandingNavbar,
    LandingHero,
    LandingFeatures,
    LandingWhy,
    LandingSteps,
    LandingCta,
    LandingFooter
  ],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing {}