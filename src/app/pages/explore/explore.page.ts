import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, searchOutline, star, starHalf, starOutline } from 'ionicons/icons';
import { AuthService, FavoriteBook } from '../../services/auth';
import { BookListItem, BookService } from '../../services/bookservice';
import { FavoriteFeedbackService } from '../../services/favorite-feedback.service';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon, IonSpinner]
})
export class ExplorePage implements OnInit {
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private favoriteFeedback = inject(FavoriteFeedbackService);
  private feedback = inject(FeedbackService);

  books: BookListItem[] = [];
  busca = '';
  genero = 'Romance';
  loading = true;
  loadingMore = false;
  salvandoFavoritos = new Set<string>();
  erro = '';
  temMaisLivros = false;
  favoritos = new Set<string>();

  private paginaAtual = 0;
  private readonly livrosPorPagina = 8;

  constructor() {
    addIcons({ heart, heartOutline, searchOutline, star, starHalf, starOutline });
  }

  async ngOnInit() {
    await this.buscarLivros();
  }

  async ionViewWillEnter() {
    await this.carregarFavoritos();
  }

  async buscarLivros() {
    this.loading = true;
    this.erro = '';
    this.books = [];
    this.paginaAtual = 0;

    try {
      await this.carregarFavoritos();
      await this.carregarPagina();
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      this.erro = 'Não foi possível buscar livros. Tente novamente.';
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
      await this.carregarPagina();
    } catch (error) {
      console.error('Erro ao carregar mais livros:', error);
      this.paginaAtual -= 1;
      this.erro = 'Não foi possível carregar mais livros.';
    } finally {
      this.loadingMore = false;
    }
  }

  private async carregarPagina() {
    const offset = this.paginaAtual * this.livrosPorPagina;
    const texto = this.busca.trim();
    const genero = this.genero.trim();
    const query = [texto, texto && genero ? genero : ''].filter(Boolean).join(' ');
    const novosLivros = query
      ? await this.bookService.searchBooks(query, this.livrosPorPagina, offset)
      : await this.bookService.getBooksByGenre(genero || 'Romance', this.livrosPorPagina, offset);

    const deduplicados = novosLivros.filter(livro => !this.books.some(item => item.id === livro.id));
    this.books = this.books.concat(deduplicados);
    this.temMaisLivros = novosLivros.length === this.livrosPorPagina;
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

  async alternarFavorito(event: Event, book: BookListItem) {
    event.preventDefault();
    event.stopPropagation();

    if (this.salvandoFavoritos.has(book.id)) {
      return;
    }

    const estavaFavorito = this.favoritos.has(book.id);
    this.marcarSalvando(book.id, true);

    try {
      if (estavaFavorito) {
        this.favoritos.delete(book.id);
        void this.favoriteFeedback.remove();
        await this.authService.removerFavorito(book.id);
        await this.feedback.info('Livro removido dos favoritos.');
        return;
      }

      this.favoritos.add(book.id);
      void this.favoriteFeedback.favorite();
      await this.authService.salvarFavorito(this.toFavoriteBook(book));
      await this.feedback.sucesso('Livro adicionado aos favoritos.');
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      if (estavaFavorito) {
        this.favoritos.add(book.id);
      } else {
        this.favoritos.delete(book.id);
      }
      this.erro = 'Nao foi possivel atualizar seus favoritos.';
      await this.feedback.erro(this.erro);
    } finally {
      this.marcarSalvando(book.id, false);
    }
  }

  private async carregarFavoritos() {
    const favoritos = await this.authService.listarFavoritos();
    this.favoritos = new Set(favoritos.map(livro => livro.id));
  }

  private toFavoriteBook(book: BookListItem): FavoriteBook {
    return {
      id: book.id,
      titulo: book.titulo,
      capa: book.capa,
      autores: book.autores,
      primeiraPublicacao: book.primeiraPublicacao,
      sinopse: book.sinopse
    };
  }

  private marcarSalvando(bookId: string, salvando: boolean) {
    const proximos = new Set(this.salvandoFavoritos);

    if (salvando) {
      proximos.add(bookId);
    } else {
      proximos.delete(bookId);
    }

    this.salvandoFavoritos = proximos;
  }
}
