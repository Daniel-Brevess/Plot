import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonBackButton, IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, heartOutline, logOutOutline, trashOutline } from 'ionicons/icons';
import { AuthService, FavoriteBook } from '../../services/auth';
import { FeedbackService } from '../../services/feedback.service';
import { normalizeGenres } from '../../services/genre-preferences';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonBackButton, IonButton, IonIcon]
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);

  nome = 'Leitor Plot';
  email = '';
  foto = 'https://i.pravatar.cc/150';
  favoritos: FavoriteBook[] = [];
  preferencias: string[] = [];
  carregandoFavoritos = true;
  removendoFavorito = '';
  erroFavoritos = '';

  constructor() {
    addIcons({ createOutline, heartOutline, logOutOutline, trashOutline });
  }

  async ngOnInit() {
    await this.carregarPerfil();
  }

  async ionViewWillEnter() {
    await this.carregarPerfil();
  }

  async sair() {
    await this.authService.logout();
    await this.router.navigate(['/home'], { replaceUrl: true });
  }

  async removerFavorito(event: Event, bookId: string) {
    event.preventDefault();
    event.stopPropagation();

    if (this.removendoFavorito) {
      return;
    }

    this.removendoFavorito = bookId;

    try {
      await this.authService.removerFavorito(bookId);
      this.favoritos = this.favoritos.filter(livro => livro.id !== bookId);
      await this.feedback.info('Livro removido dos favoritos.');
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      this.erroFavoritos = 'Nao foi possivel remover este favorito.';
      await this.feedback.erro(this.erroFavoritos);
    } finally {
      this.removendoFavorito = '';
    }
  }

  private async carregarPerfil() {
    const usuario = this.authService.getUsuarioAtual();

    if (!usuario) {
      return;
    }

    this.nome = usuario.displayName || this.nome;
    this.email = usuario.email || '';
    this.foto = localStorage.getItem(`fotoPerfil:${usuario.uid}`)
      || usuario.photoURL
      || this.foto;

    await this.carregarFavoritos();
    await this.carregarPreferencias();
  }

  private async carregarFavoritos() {
    this.carregandoFavoritos = true;
    this.erroFavoritos = '';

    try {
      this.favoritos = await this.authService.listarFavoritos();
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      this.erroFavoritos = 'Nao foi possivel carregar seus favoritos.';
    } finally {
      this.carregandoFavoritos = false;
    }
  }

  private async carregarPreferencias() {
    try {
      this.preferencias = normalizeGenres(await this.authService.carregarPreferencias());
    } catch (error) {
      console.error('Erro ao carregar preferencias:', error);
      this.preferencias = [];
    }
  }
}
