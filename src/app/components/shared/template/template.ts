import { Component } from '@angular/core';
import { Aside } from "../aside/aside";
import { Header } from "../header/header";

@Component({
  selector: 'app-template',
  imports: [Aside, Header],
  templateUrl: './template.html',
  styleUrls: ['./template.css'],
})
export class Template {

}
