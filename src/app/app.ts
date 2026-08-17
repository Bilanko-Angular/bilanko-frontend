import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/shared/header/header";
import { Aside } from "./components/shared/aside/aside";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Aside],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bilanko');
}
