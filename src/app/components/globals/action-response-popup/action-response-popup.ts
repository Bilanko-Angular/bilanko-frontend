import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-response-popup',
  imports: [CommonModule],
  templateUrl: './action-response-popup.html',
  styleUrl: './action-response-popup.css',
})
export class ActionResponsePopup {
  message="Message envoyé avec succès"
  isSuccess=true
}
