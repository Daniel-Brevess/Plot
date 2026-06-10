import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, calendarOutline, heart, heartOutline, openOutline, personOutline, pricetagOutline, star, starHalf, starOutline } from 'ionicons/icons';
import { AuthService, FavoriteBook } from '../../services/auth';
import { BookDetail, BookService } from '../../services/bookservice';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonButton, IonContent, IonIcon, IonSpinner]
})
export class BookDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private location = inject(Location);
  private authService = inject(AuthService);
  private feedback = inject(FeedbackService);

  book: BookDetail | null = null;
  loading = true;
  salvandoFavorito = false;
  favorito = false;
  error = '';

  constructor() {
    addIcons({ arrowBackOutline, calendarOutline, heart, heartOutline, openOutline, personOutline, pricetagOutline, star, starHalf, starOutline });
  }

  async ngOnInit() {
    const workId = this.route.snapshot.paramMap.get('workId');

    if (!workId) {
      this.error = 'Livro nao encontrado.';
      this.loading = false;
      return;
    }

    try {
      this.book = await this.bookService.getBookDetails(workId);
      this.favorito = await this.authService.ehFavorito(this.book.id);
    } catch (error) {
      console.error('Erro ao carregar livro:', error);
      this.error = 'Nao foi possivel carregar os detalhes deste livro.';
    } finally {
      this.loading = false;
    }
  }

  get topSubjects() {
    return this.book?.assuntos.slice(0, 12) || [];
  }

  voltar() {
    this.location.back();
  }

  async alternarFavorito() {
    if (!this.book || this.salvandoFavorito) {
      return;
    }

    this.salvandoFavorito = true;

    try {
      if (this.favorito) {
        await this.authService.removerFavorito(this.book.id);
        this.favorito = false;
        await this.feedback.info('Livro removido dos favoritos.');
        return;
      }

      await this.authService.salvarFavorito(this.toFavoriteBook(this.book));
      this.favorito = true;
      await this.feedback.sucesso('Livro adicionado aos favoritos.');
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      this.error = 'Nao foi possivel atualizar seus favoritos.';
      await this.feedback.erro(this.error);
    } finally {
      this.salvandoFavorito = false;
    }
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

  getRatingCount(estrela: number): number {
    return this.book?.avaliacao.distribuicao[estrela as 1 | 2 | 3 | 4 | 5] || 0;
  }

  getRatingPercentage(estrela: number): number {
    const total = this.book?.avaliacao.total || 0;
    return total ? (this.getRatingCount(estrela) / total) * 100 : 0;
  }

  private toFavoriteBook(book: BookDetail): FavoriteBook {
    return {
      id: book.id,
      titulo: book.titulo,
      capa: book.capa,
      autores: book.autores,
      primeiraPublicacao: book.primeiraPublicacao,
      sinopse: book.descricao
    };
  }
}
