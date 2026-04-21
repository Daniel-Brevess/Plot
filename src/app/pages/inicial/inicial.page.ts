import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonModal, IonItem, IonInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-inicial',
  templateUrl: './inicial.page.html',
  styleUrls: ['./inicial.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonModal, IonItem, IonInput, CommonModule, FormsModule, RouterLink]
})
export class InicialPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
