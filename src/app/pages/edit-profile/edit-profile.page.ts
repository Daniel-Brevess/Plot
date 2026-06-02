import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class EditProfilePage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = {
    nome: '',
    email: ''
  };

  foto = 'https://i.pravatar.cc/150';
  salvando = false;

  ngOnInit() {
    const usuario = this.authService.getUsuarioAtual();

    if (!usuario) {
      this.router.navigate(['/home']);
      return;
    }

    this.user.nome = usuario.displayName || '';
    this.user.email = usuario.email || '';
    this.foto = localStorage.getItem(this.fotoStorageKey(usuario.uid))
      || usuario.photoURL
      || this.foto;
  }

  async salvar() {
    const usuario = this.authService.getUsuarioAtual();

    if (!usuario || !this.user.nome.trim()) {
      return;
    }

    this.salvando = true;

    try {
      await this.authService.atualizarPerfil(this.user.nome.trim());
      localStorage.setItem(this.fotoStorageKey(usuario.uid), this.foto);
      alert('Perfil atualizado!');
      await this.router.navigate(['/profile']);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Não foi possível atualizar o perfil. Tente novamente.');
    } finally {
      this.salvando = false;
    }
  }

  selecionarFoto() {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    input?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.foto = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  private fotoStorageKey(uid: string) {
    return `fotoPerfil:${uid}`;
  }
}
