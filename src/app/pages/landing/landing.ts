import { Component } from '@angular/core';
import { NavbarLanding } from "../../components/landing/navbar-landing/navbar-landing";
import { Hero } from "../../components/landing/hero/hero";
import { Features } from "../../components/landing/features/features";
import { HowItWorks } from "../../components/landing/how-it-works/how-it-works";
import { CtaBanner } from "../../components/landing/cta-banner/cta-banner";
import { FooterLanding } from "../../components/landing/footer-landing/footer-landing";

@Component({
  selector: 'app-landing',
  imports: [NavbarLanding, Hero, Features, HowItWorks, CtaBanner, FooterLanding],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {

}
