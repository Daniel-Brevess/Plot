import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { onAuthStateChanged } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth';
import { FeedbackService } from '../services/feedback.service';

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
  ]
})
export class HomePage implements OnInit {
  email = '';
  senha = '';
  nome = '';
  isLoginOpen = false;
  isRegisterOpen = false;
  recuperandoSenha = false;

  constructor(
    private authService: AuthService,
    private feedback: FeedbackService,
    private router: Router
  ) {}

  ngOnInit() {
    onAuthStateChanged(this.authService.auth, async (user) => {
      if (user) {
        await this.direcionarUsuario(user.uid);
      }
    });
  }

  setLoginOpen(isOpen: boolean) {
    this.isLoginOpen = isOpen;
  }

  setRegisterOpen(isOpen: boolean) {
    this.isRegisterOpen = isOpen;
  }

  async direcionarUsuario(uid: string) {
    try {
      const jaFezQuestionario = await this.authService.usuarioTemPreferencias(uid);
      await this.router.navigate([jaFezQuestionario ? '/feed' : '/questionario'], { replaceUrl: true });
    } catch (error) {
      console.error('Erro ao verificar preferencias:', error);
      await this.feedback.erro('Nao foi possivel carregar suas preferencias. Tente entrar novamente.');
    }
  }

  async cadastrar() {
    try {
      await this.authService.cadastrar(this.nome, this.email, this.senha);
      this.setRegisterOpen(false);
      await this.feedback.sucesso('Conta criada. Escolha seus generos para montar o feed.');
      await this.router.navigate(['/questionario'], { replaceUrl: true });
    } catch (err) {
      console.error('Erro no cadastro:', err);
      await this.feedback.erro(this.getMensagemErroCadastro(err));
    }
  }

  async login() {
    try {
      const credential = await this.authService.login(this.email, this.senha);
      this.setLoginOpen(false);
      await this.feedback.sucesso('Login realizado.');
      await this.direcionarUsuario(credential.user.uid);
    } catch (err) {
      console.error('Erro no login:', err);
      await this.feedback.erro(this.getMensagemErroLogin(err));
    }
  }

  async recuperarSenha(emailValue?: string | number | null) {
    const email = String(emailValue ?? this.email).trim().toLowerCase();

    if (!email) {
      await this.feedback.info('Digite seu e-mail para receber o link de recuperacao.');
      return;
    }

    this.recuperandoSenha = true;

    try {
      await this.authService.recuperarSenha(email);
      await this.feedback.sucesso('Se este e-mail estiver cadastrado, o link foi enviado. Verifique a caixa de entrada e o spam.');
    } catch (err) {
      console.error('Erro na recuperacao de senha:', err);
      await this.feedback.erro(this.getMensagemErroRecuperacaoSenha(err));
    } finally {
      this.recuperandoSenha = false;
    }
  }

  async loginGoogle() {
    try {
      const credential = await this.authService.loginComGoogle();
      this.setLoginOpen(false);
      this.setRegisterOpen(false);
      await this.feedback.sucesso('Login com Google realizado.');
      await this.direcionarUsuario(credential.user.uid);
    } catch (err) {
      console.error('Erro no Google:', err);
      await this.feedback.erro(this.getMensagemErroGoogle(err));
    }
  }

  private getMensagemErroCadastro(err: unknown): string {
    const error = err as { code?: string };

    switch (error?.code) {
      case 'auth/email-already-in-use':
        return 'Este e-mail ja esta cadastrado. Tente entrar na conta.';
      case 'auth/invalid-email':
        return 'Digite um e-mail valido para criar a conta.';
      case 'auth/weak-password':
        return 'Use uma senha mais forte, com pelo menos 6 caracteres.';
      default:
        return 'Nao foi possivel criar a conta. Verifique os dados e tente novamente.';
    }
  }

  private getMensagemErroLogin(err: unknown): string {
    const error = err as { code?: string };

    switch (error?.code) {
      case 'auth/invalid-email':
        return 'Digite um e-mail valido para entrar.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'E-mail ou senha incorretos.';
      default:
        return 'Nao foi possivel entrar. Verifique os dados e tente novamente.';
    }
  }

  private getMensagemErroGoogle(err: unknown): string {
    const error = err as { code?: string; message?: string };
    const code = error?.code || '';
    const message = error?.message || '';
    const detail = message || code || 'erro desconhecido';

    if (code === 'auth/operation-not-allowed') {
      return 'Login com Google nao esta habilitado no Firebase Authentication.';
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
      return `Nao foi possivel entrar com o Google. Confira Web Client ID, pacote Android e SHA no Firebase. Detalhe: ${detail}`;
    }

    return `Nao foi possivel entrar com o Google. Verifique a configuracao do aplicativo ou tente novamente. Detalhe: ${detail}`;
  }

  private getMensagemErroRecuperacaoSenha(err: unknown): string {
    const error = err as { code?: string };

    switch (error?.code) {
      case 'auth/invalid-email':
        return 'Digite um e-mail valido para recuperar a senha.';
      case 'auth/user-not-found':
        return 'Nao encontramos uma conta com esse e-mail.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      default:
        return 'Nao foi possivel enviar o e-mail de recuperacao. Tente novamente.';
    }
  }
}
