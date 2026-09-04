import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Aside } from "../aside/aside";
import { Header } from "../header/header";

@Component({
  selector: 'app-template',
  imports: [Aside, Header],
  templateUrl: './template.html',
  styleUrls: ['./template.css'],
})
export class Template implements AfterViewInit {
  @ViewChild('asideComponent') asideComponent!: Aside;

  ngAfterViewInit() {
    // Assurer que le composant est bien chargé
  }

  // ✅ Appelé par le bouton hamburger
  toggleMenu(): void {
    if (this.asideComponent) {
      this.asideComponent.toggleMenu();
    }
  }
}