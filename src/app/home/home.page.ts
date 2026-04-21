import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonModal, IonItem, IonInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, RouterModule, IonModal, IonItem, IonInput, FormsModule],
})

export class HomePage {
  email = '';
  senha = '';
  nome = '';

  constructor(private authService: AuthService, private router: Router) {}

  async cadastrar() {
  try {
    await this.authService.cadastrar(this.nome, this.email, this.senha);
    console.log('Usuário cadastrado!');
    this.router.navigate(['/questionario']);
  } catch (err) {
    console.error(err);
  }
}

async login() {
    try {
      await this.authService.login(this.email, this.senha);
      console.log('Usuário logado!');
      // Se já logou antes, talvez ele vá direto para a Home principal ou Questionário
      this.router.navigate(['/questionario']); 
    } catch (err) {
      console.error('Erro no login:', err);
      alert('E-mail ou senha incorretos.');
    }
  }
  
  }
