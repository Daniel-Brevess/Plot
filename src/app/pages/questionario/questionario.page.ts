import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { AuthService } from '../../services/auth'; // Caminho do seu serviço
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-questionario',
  templateUrl: './questionario.page.html',
  styleUrls: ['./questionario.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonButton,
    CommonModule,
    FormsModule
  ]
})
export class QuestionarioPage implements OnInit {

  // Lista de gêneros (Paleta Plot)
  genres: string[] = [
    'Romance', 'Ficção Científica', 'Fantasia', 
    'Terror', 'Biografia', 'História', 
    'Suspense', 'Autoajuda', 'Poesia',
    'Drama', 'Aventura', 'Clássicos'
  ];

  form = {
    selectedGenres: [] as string[]
  };

  submitting = false;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) { }

  ngOnInit() { }

  // Seleção limitada a exatamente 3
  toggleGenre(g: string) {
    const index = this.form.selectedGenres.indexOf(g);
    
    if (index > -1) {
      this.form.selectedGenres.splice(index, 1);
    } else {
      if (this.form.selectedGenres.length < 3) {
        this.form.selectedGenres.push(g);
      }
    }
  }

  isSelected(g: string): boolean {
    return this.form.selectedGenres.includes(g);
  }

  // Submissão utilizando o método getUsuarioAtual()
  async submit() {
    if (this.form.selectedGenres.length !== 3) {
      return;
    }

    this.submitting = true;

    try {
      // Chamada ao método que criámos no AuthService
      const usuario = this.authService.getUsuarioAtual();

      if (usuario && usuario.uid) {
        // Gravação no Firestore
      await this.authService.salvarPreferencias(usuario.uid, this.form.selectedGenres);

      console.log('Preferências salvas com sucesso no Firestore!');

      // Navega para o feed e limpa o histórico para o usuário não voltar ao questionário
      this.router.navigate(['/feed'], { replaceUrl: true });
      } else {
        console.error('Usuário não identificado pelo AuthService');
        alert('Sessão inválida. Por favor, faça login novamente.');
        this.router.navigate(['/home']);
      }
    } catch (err) {
      console.error('Erro ao persistir preferências:', err);
      alert('Erro ao guardar as suas escolhas. Tente novamente.');
    } finally {
      this.submitting = false;
    }
  }
}