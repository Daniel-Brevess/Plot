import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth';
import { PLOT_GENRES, normalizeGenres } from '../../services/genre-preferences';

@Component({
  selector: 'app-questionario',
  templateUrl: './questionario.page.html',
  styleUrls: ['./questionario.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, CommonModule, FormsModule]
})
export class QuestionarioPage implements OnInit {
  genres = PLOT_GENRES;

  form = {
    selectedGenres: [] as string[]
  };

  loading = true;
  submitting = false;
  erro = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.carregarPreferencias();
  }

  toggleGenre(genero: string) {
    const index = this.form.selectedGenres.indexOf(genero);

    if (index > -1) {
      this.form.selectedGenres.splice(index, 1);
      return;
    }

    if (this.form.selectedGenres.length < 3) {
      this.form.selectedGenres.push(genero);
    }
  }

  isSelected(genero: string): boolean {
    return this.form.selectedGenres.includes(genero);
  }

  async submit() {
    if (this.form.selectedGenres.length !== 3) {
      return;
    }

    const usuario = this.authService.getUsuarioAtual();

    if (!usuario?.uid) {
      this.erro = 'Sessao invalida. Entre novamente para salvar suas preferencias.';
      await this.router.navigate(['/home']);
      return;
    }

    this.submitting = true;
    this.erro = '';

    try {
      await this.authService.salvarPreferencias(usuario.uid, this.form.selectedGenres);
      await this.router.navigate(['/feed'], { replaceUrl: true });
    } catch (error) {
      console.error('Erro ao persistir preferencias:', error);
      this.erro = 'Nao foi possivel salvar suas preferencias. Tente novamente.';
    } finally {
      this.submitting = false;
    }
  }

  private async carregarPreferencias() {
    this.loading = true;
    this.erro = '';

    try {
      this.form.selectedGenres = normalizeGenres(await this.authService.carregarPreferencias());
    } catch (error) {
      console.error('Erro ao carregar preferencias:', error);
      this.erro = 'Nao foi possivel carregar suas preferencias atuais.';
    } finally {
      this.loading = false;
    }
  }
}
