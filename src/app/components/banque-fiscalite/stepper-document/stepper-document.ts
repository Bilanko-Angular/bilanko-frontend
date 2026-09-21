import { Component, EventEmitter, Input, Output } from '@angular/core';

type Etape = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-stepper-document',
  standalone: true,
  imports: [],
  templateUrl: './stepper-document.html',
  styleUrl: './stepper-document.css',
})
export class StepperDocument {
  @Input({ required: true }) etape!: Etape;
  @Output() allerA = new EventEmitter<Etape>();
}
