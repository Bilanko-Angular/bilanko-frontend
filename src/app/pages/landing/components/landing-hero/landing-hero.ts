// src/app/pages/landing/components/landing-hero/landing-hero.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [RouterLink, AnimateOnScrollDirective],
  templateUrl: './landing-hero.html',
  styleUrls: ['./landing-hero.css']
})
export class LandingHero {}