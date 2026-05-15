import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable para monitorar o estado da autenticação em tempo real
  user$: Observable<User | null>;

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
   * Login/Cadastro via Google
   */
  loginComGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  /**
   * Finaliza a sessão
   */
  logout() {
    return signOut(this.auth);
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