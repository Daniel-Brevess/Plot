import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonBackButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonBackButton, IonIcon]
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);

  nome = 'Leitor Plot';
  email = '';
  foto = 'https://i.pravatar.cc/150';

  constructor() {
    addIcons({ createOutline });
  }

  ngOnInit() {
    this.carregarPerfil();
  }

  ionViewWillEnter() {
    this.carregarPerfil();
  }

  private carregarPerfil() {
    const usuario = this.authService.getUsuarioAtual();

    if (!usuario) {
      return;
    }

    this.nome = usuario.displayName || this.nome;
    this.email = usuario.email || '';
    this.foto = localStorage.getItem(`fotoPerfil:${usuario.uid}`)
      || usuario.photoURL
      || this.foto;
  }
}
