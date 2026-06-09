import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, calendarOutline, openOutline, personOutline, pricetagOutline } from 'ionicons/icons';
import { BookDetail, BookService } from '../../services/bookservice';

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

  book: BookDetail | null = null;
  loading = true;
  error = '';

  constructor() {
    addIcons({ arrowBackOutline, calendarOutline, openOutline, personOutline, pricetagOutline });
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
}
