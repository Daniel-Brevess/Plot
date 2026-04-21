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
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Esse Observable permite que o app saiba em tempo real se o usuário está logado
  user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
  }

  async cadastrar(nome: string, email: string, senha: string) {
  // 1. Cria o usuário
  const userCredential = await createUserWithEmailAndPassword(this.auth, email, senha);
  
  // 2. Salva o nome no perfil do Firebase Auth
  if (userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName: nome
    });
  }
  
  return userCredential;
}

  // Login com e-mail existente
  login(email: string, senha: string) {
    return signInWithEmailAndPassword(this.auth, email, senha);
  }

  // Login com o Google (Popup para Web/Android)
  loginComGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // Deslogar do sistema
  logout() {
    return signOut(this.auth);
  }
}