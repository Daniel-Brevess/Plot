import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { onAuthStateChanged } from '@angular/fire/auth';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonModal, 
  IonItem, 
  IonInput,
  IonIcon 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    RouterModule, 
    IonModal, 
    IonItem, 
    IonInput, 
    IonIcon,
    FormsModule
  ],
})
export class HomePage implements OnInit {
  // Inputs do formulário
  email = '';
  senha = '';
  nome = '';

  // Controle de estado dos Modais
  isLoginOpen = false;
  isRegisterOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Verifica automaticamente se o usuário já está logado ao abrir o app
    onAuthStateChanged(this.authService.auth, async (user) => {
      if (user) {
        await this.direcionarUsuario(user.uid);
      }
    });
  }

  // Funções para abrir/fechar modais
  setLoginOpen(isOpen: boolean) {
    this.isLoginOpen = isOpen;
  }

  setRegisterOpen(isOpen: boolean) {
    this.isRegisterOpen = isOpen;
  }

  // Lógica central de navegação baseada no Firestore
  async direcionarUsuario(uid: string) {
    try {
      const jaFezQuestionario = await this.authService.usuarioTemPreferencias(uid);
      
      if (jaFezQuestionario) {
        console.log('Usuário já tem perfil, indo para o Feed...');
        this.router.navigate(['/feed'], { replaceUrl: true });
      } else {
        console.log('Usuário novo, indo para o Questionário...');
        this.router.navigate(['/questionario'], { replaceUrl: true });
      }
    } catch (error) {
      console.error('Erro ao verificar preferências:', error);
    }
  }

  async cadastrar() {
    try {
      const credential = await this.authService.cadastrar(this.nome, this.email, this.senha);
      console.log('Usuário cadastrado!');
      
      this.setRegisterOpen(false);
      // Após o cadastro, sempre vai para o questionário primeiro
      this.router.navigate(['/questionario'], { replaceUrl: true });
    } catch (err) {
      console.error('Erro no cadastro:', err);
      alert('Erro ao criar conta. Verifique os dados.');
    }
  }

  async login() {
    try {
      const credential = await this.authService.login(this.email, this.senha);
      
      this.setLoginOpen(false);
      await this.direcionarUsuario(credential.user.uid);
    } catch (err) {
      console.error('Erro no login:', err);
      alert('E-mail ou senha incorretos.');
    }
  }

  async loginGoogle() {
    try {
      const credential = await this.authService.loginComGoogle();
      
      this.setLoginOpen(false);
      this.setRegisterOpen(false);
      
      await this.direcionarUsuario(credential.user.uid);
    } catch (err) {
      console.error('Erro no Google:', err);
    }
  }
}