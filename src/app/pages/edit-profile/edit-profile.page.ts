import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class EditProfilePage implements OnInit {
  private authService = inject(AuthService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);

  user = {
    nome: ''
  };

  email = '';
  foto = 'https://i.pravatar.cc/150';
  salvando = false;
  carregandoFoto = false;

  ngOnInit() {
    const usuario = this.authService.getUsuarioAtual();

    if (!usuario) {
      this.router.navigate(['/home']);
      return;
    }

    this.user.nome = usuario.displayName || '';
    this.email = usuario.email || '';
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
      await this.feedback.sucesso('Perfil atualizado.');
      await this.router.navigate(['/profile']);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      await this.feedback.erro('Nao foi possivel atualizar o perfil. Tente novamente.');
    } finally {
      this.salvando = false;
    }
  }

  async escolherFoto() {
    await this.carregarFoto(CameraSource.Photos);
  }

  async tirarFoto() {
    await this.carregarFoto(CameraSource.Camera);
  }

  selecionarArquivo() {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    input?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      this.foto = reader.result as string;
      await this.feedback.sucesso('Foto pronta para salvar.');
    };

    reader.readAsDataURL(file);
  }

  private async carregarFoto(source: CameraSource) {
    this.carregandoFoto = true;

    try {
      const image = await Camera.getPhoto({
        quality: 75,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source
      });

      if (image.dataUrl) {
        this.foto = image.dataUrl;
        await this.feedback.sucesso('Foto pronta para salvar.');
      }
    } catch (error) {
      console.error('Erro ao carregar foto:', error);
      await this.feedback.info('Nenhuma foto foi selecionada.');
    } finally {
      this.carregandoFoto = false;
    }
  }

  private fotoStorageKey(uid: string) {
    return `fotoPerfil:${uid}`;
  }
}
