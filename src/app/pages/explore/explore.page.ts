import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, starOutline } from 'ionicons/icons';
import { BookListItem, BookService } from '../../services/bookservice';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon, IonSpinner]
})
export class ExplorePage implements OnInit {
  private bookService = inject(BookService);

  books: BookListItem[] = [];
  busca = '';
  genero = 'Romance';
  loading = true;
  loadingMore = false;
  erro = '';
  temMaisLivros = false;

  private paginaAtual = 0;
  private readonly livrosPorPagina = 8;

  constructor() {
    addIcons({ searchOutline, starOutline });
  }

  async ngOnInit() {
    await this.buscarLivros();
  }

  async buscarLivros() {
    this.loading = true;
    this.erro = '';
    this.books = [];
    this.paginaAtual = 0;

    try {
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
}
