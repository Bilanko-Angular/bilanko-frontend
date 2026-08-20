import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../../directive/animate-on-scroll.directive';

@Component({
  selector: 'app-cta-banner',
  imports: [AnimateOnScrollDirective],
  templateUrl: './cta-banner.html',
  styleUrl: './cta-banner.css',
})
export class CtaBanner {

}
