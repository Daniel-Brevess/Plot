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
  recuperandoSenha = false;

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

  async recuperarSenha() {
    const email = this.email.trim();

    if (!email) {
      alert('Digite seu e-mail para receber o link de recuperação de senha.');
      return;
    }

    this.recuperandoSenha = true;

    try {
      await this.authService.recuperarSenha(email);
      alert('Enviamos um link de recuperação de senha para o seu e-mail.');
    } catch (err) {
      console.error('Erro na recuperação de senha:', err);
      alert(this.getMensagemErroRecuperacaoSenha(err));
    } finally {
      this.recuperandoSenha = false;
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
      alert(this.getMensagemErroGoogle(err));
    }
  }

  private getMensagemErroGoogle(err: unknown): string {
    const error = err as { code?: string; message?: string };
    const code = error?.code || '';
    const message = error?.message || '';

    if (code === 'auth/operation-not-allowed') {
      return 'Login com Google não está habilitado no Firebase Authentication. Ative o provedor Google no console do Firebase.';
    }

    if (code === 'SIGN_IN_CANCELED' || message.toLowerCase().includes('canceled')) {
      return 'Login com Google cancelado.';
    }

    if (
      message.toLowerCase().includes('developer_error') ||
      message.toLowerCase().includes('10:') ||
      message.toLowerCase().includes('client') ||
      message.toLowerCase().includes('certificate') ||
      message.toLowerCase().includes('sha')
    ) {
      return `Não foi possível entrar com o Google. Confira o Web Client ID, o pacote Android e o SHA-1/SHA-256 no Firebase.\n\nDetalhe: ${message || code}`;
    }

    return `Não foi possível entrar com o Google. Verifique a configuração do aplicativo ou tente novamente.\n\nDetalhe: ${message || code || 'erro desconhecido'}`;
  }

  private getMensagemErroRecuperacaoSenha(err: unknown): string {
    const error = err as { code?: string };

    switch (error?.code) {
      case 'auth/invalid-email':
        return 'Digite um e-mail válido para recuperar a senha.';
      case 'auth/user-not-found':
        return 'Não encontramos uma conta com esse e-mail.';
      default:
        return 'Não foi possível enviar o e-mail de recuperação. Tente novamente.';
    }
  }
}
