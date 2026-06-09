import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starHalf, starOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth';
import { BookListItem, BookService } from '../../services/bookservice';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

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
  erro = '';
  temMaisLivros = false;

  private generos: string[] = [];
  private paginaAtual = 0;
  private readonly livrosPorGenero = 4;

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private firestore: Firestore
  ) {
    addIcons({ star, starHalf, starOutline });
  }

  async ngOnInit() {
    await this.carregarRecomendacoes();
  }

  async carregarRecomendacoes() {
    this.loading = true;
    this.erro = '';
    this.livros = [];
    this.paginaAtual = 0;

    try {
      const user = this.authService.getUsuarioAtual();

      if (!user) {
        return;
      }

      const docRef = doc(this.firestore, `usuarios/${user.uid}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.generos = docSnap.data()['preferencias'] || [];
        await this.carregarPaginaDeRecomendacoes();
      }
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
}
