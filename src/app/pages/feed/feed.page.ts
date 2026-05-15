import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth';
import { BookService } from '../../services/bookservice';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonSpinner, CommonModule]
})
export class FeedPage implements OnInit {
  
  livros: any[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private firestore: Firestore
  ) {
    addIcons({ starOutline });
  }

  async ngOnInit() {
    await this.carregarRecomendacoes();
  }

  async carregarRecomendacoes() {
    this.loading = true;
    try {
      const user = this.authService.getUsuarioAtual();
      
      if (user) {
        // Busca as preferências direto do Firestore
        const docRef = doc(this.firestore, `usuarios/${user.uid}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const generos = docSnap.data()['preferencias'] || [];
          
          // Busca livros para cada gênero selecionado (em paralelo)
          const promises = generos.map((g: string) => this.bookService.getBooksByGenre(g));
          const resultados = await Promise.all(promises);
          
          // Achata o array e embaralha os resultados
          this.livros = resultados.reduce((acc, val) => acc.concat(val), []).sort(() => Math.random() - 0.5);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      this.loading = false;
    }
  }

  irParaExplorar() { /* navegação */ }
  irParaPerfil() { /* navegação */ }
}
