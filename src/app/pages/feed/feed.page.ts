import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, star, starHalf, starOutline } from 'ionicons/icons';
import { AuthService, FavoriteBook } from '../../services/auth';
import { BookListItem, BookService } from '../../services/bookservice';
import { FeedbackService } from '../../services/feedback.service';
import { normalizeGenres } from '../../services/genre-preferences';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner, CommonModule, RouterLink]
})
export class FeedPage implements OnInit {
  livros: BookListItem[] = [];
  loading = true;
  loadingMore = false;
  salvandoFavorito = '';
  erro = '';
  temMaisLivros = false;
  favoritos = new Set<string>();

  private generos: string[] = [];
  private preferenciasKey = '';
  private paginaAtual = 0;
  private readonly livrosPorGenero = 4;

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private feedback: FeedbackService
  ) {
    addIcons({ heart, heartOutline, star, starHalf, starOutline });
  }

  async ngOnInit() {
    await this.carregarRecomendacoes();
  }

  async ionViewWillEnter() {
    const preferencias = normalizeGenres(await this.authService.carregarPreferencias());
    const preferenciasKey = preferencias.join('|');

    if (this.preferenciasKey && preferenciasKey !== this.preferenciasKey) {
      await this.carregarRecomendacoes();
      return;
    }

    await this.carregarFavoritos();
  }

  async carregarRecomendacoes() {
    this.loading = true;
    this.erro = '';
    this.livros = [];
    this.paginaAtual = 0;

    try {
      this.generos = normalizeGenres(await this.authService.carregarPreferencias());
      this.preferenciasKey = this.generos.join('|');
      await this.carregarPaginaDeRecomendacoes();
      await this.carregarFavoritos();
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      this.erro = 'Não foi possível carregar as recomendações. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }

  async carregarMais() {
    if (this.loadingMore || !this.temMaisLivros) {
      return;
    }

    this.loadingMore = true;
    this.paginaAtual += 1;

    try {
      await this.carregarPaginaDeRecomendacoes();
    } catch (error) {
      console.error('Erro ao carregar mais recomendações:', error);
      this.paginaAtual -= 1;
      this.erro = 'Não foi possível carregar mais livros. Tente novamente.';
    } finally {
      this.loadingMore = false;
    }
  }

  private async carregarPaginaDeRecomendacoes() {
    if (!this.generos.length) {
      this.temMaisLivros = false;
      return;
    }

    const offset = this.paginaAtual * this.livrosPorGenero;
    const promises = this.generos.map(g => this.bookService.getBooksByGenre(g, this.livrosPorGenero, offset));
    const resultados = await Promise.all(promises);
    const novosLivros = resultados
      .reduce<BookListItem[]>((acc, val) => acc.concat(val), [])
      .filter(livro => !this.livros.some(item => item.id === livro.id))
      .sort(() => Math.random() - 0.5);

    this.livros = this.livros.concat(novosLivros);
    this.temMaisLivros = resultados.some(resultado => resultado.length === this.livrosPorGenero);
  }

  getRatingIcon(media: number | null, estrela: number): string {
    if (!media) {
      return 'star-outline';
    }

    if (media >= estrela) {
      return 'star';
    }

    return media >= estrela - 0.5 ? 'star-half' : 'star-outline';
  }

  async alternarFavorito(event: Event, livro: BookListItem) {
    event.preventDefault();
    event.stopPropagation();

    if (this.salvandoFavorito) {
      return;
    }

    this.salvandoFavorito = livro.id;

    try {
      if (this.favoritos.has(livro.id)) {
        await this.authService.removerFavorito(livro.id);
        this.favoritos.delete(livro.id);
        await this.feedback.info('Livro removido dos favoritos.');
        return;
      }

      await this.authService.salvarFavorito(this.toFavoriteBook(livro));
      this.favoritos.add(livro.id);
      await this.feedback.sucesso('Livro adicionado aos favoritos.');
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      this.erro = 'Nao foi possivel atualizar seus favoritos.';
      await this.feedback.erro(this.erro);
    } finally {
      this.salvandoFavorito = '';
    }
  }

  private async carregarFavoritos() {
    const favoritos = await this.authService.listarFavoritos();
    this.favoritos = new Set(favoritos.map(livro => livro.id));
  }

  private toFavoriteBook(livro: BookListItem): FavoriteBook {
    return {
      id: livro.id,
      titulo: livro.titulo,
      capa: livro.capa,
      autores: livro.autores,
      primeiraPublicacao: livro.primeiraPublicacao,
      sinopse: livro.sinopse
    };
  }
}
