import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline } from 'ionicons/icons';
import { BookService } from '../../services/bookservice';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonIcon, IonSpinner]
})
export class ExplorePage implements OnInit {
  private bookService = inject(BookService);

  books: any[] = [];
  loading = true;

  constructor() {
    addIcons({ starOutline });
  }

  async ngOnInit() {
    this.books = await this.bookService.getBooksByGenre('Romance');
    this.loading = false;
  }
}
