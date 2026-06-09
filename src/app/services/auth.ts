import { Injectable } from '@angular/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Capacitor } from '@capacitor/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  user,
  User,
  updateProfile
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable para monitorar o estado da autenticação em tempo real
  user$: Observable<User | null>;
  private googleSignInInitialized = false;

  constructor(
    public auth: Auth, // Deixamos como public para o Questionário acessar .currentUser
    private firestore: Firestore
  ) {
    this.user$ = user(this.auth);
  }

  /**
   * Retorna o objeto do usuário logado no momento (Snapshot)
   */
  getUsuarioAtual(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Cria um novo usuário e já atualiza o nome no perfil
   */
  async cadastrar(nome: string, email: string, senha: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, senha);
    
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: nome
      });
    }
    
    return userCredential;
  }

  /**
   * Login tradicional
   */
  login(email: string, senha: string) {
    return signInWithEmailAndPassword(this.auth, email, senha);
  }

  /**
   * Envia o e-mail de recuperacao de senha para o usuario.
   */
  recuperarSenha(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  /**
   * Login/Cadastro via Google
   */
  async loginComGoogle() {
    const provider = new GoogleAuthProvider();

    if (Capacitor.getPlatform() !== 'web') {
      await this.initializeNativeGoogleSignIn();
      const result = await GoogleSignIn.signIn();
      const credential = GoogleAuthProvider.credential(result.idToken);

      return signInWithCredential(this.auth, credential);
    }

    return signInWithPopup(this.auth, provider);
  }

  /**
   * Finaliza a sessão
   */
  async logout() {
    await signOut(this.auth);

    if (Capacitor.getPlatform() !== 'web' && environment.googleWebClientId) {
      await this.initializeNativeGoogleSignIn();
      await GoogleSignIn.signOut();
    }
  }

  private async initializeNativeGoogleSignIn() {
    if (this.googleSignInInitialized) {
      return;
    }

    if (!environment.googleWebClientId) {
      throw new Error('Configure environment.googleWebClientId para habilitar o login Google no APK.');
    }

    await GoogleSignIn.initialize({
      clientId: environment.googleWebClientId
    });

    this.googleSignInInitialized = true;
  }

  /**
   * Atualiza os dados básicos exibidos no perfil.
   */
  async atualizarPerfil(nome: string) {
    const usuario = this.getUsuarioAtual();

    if (!usuario) {
      throw new Error('Usuário não autenticado.');
    }

    await updateProfile(usuario, { displayName: nome });

    const userDocRef = doc(this.firestore, `usuarios/${usuario.uid}`);
    return setDoc(userDocRef, {
      nome,
      email: usuario.email,
      atualizadoEm: new Date()
    }, { merge: true });
  }

  /**
   * FIRESTORE: Salva ou atualiza os gêneros escolhidos pelo usuário
   */
  async salvarPreferencias(uid: string, generos: string[]) {
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    return setDoc(userDocRef, {
      preferencias: generos,
      atualizadoEm: new Date()
    }, { merge: true });
  }

  /**
   * FIRESTORE: Verifica se o usuário já preencheu o questionário
   * Útil para decidir se ele vai para o Feed ou para o Questionário ao logar
   */
  async usuarioTemPreferencias(uid: string): Promise<boolean> {
    const docRef = doc(this.firestore, `usuarios/${uid}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const dados = docSnap.data();
      // Retorna true apenas se o campo preferencias existir e não estiver vazio
      return !!(dados['preferencias'] && dados['preferencias'].length > 0);
    }
    return false;
  }
}
