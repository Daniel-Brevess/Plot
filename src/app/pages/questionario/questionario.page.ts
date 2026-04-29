import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonChip,
  IonLabel,
  IonItem,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonRange,
  IonCheckbox,
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
    IonChip,
    IonLabel,
    IonItem,
    IonInput,
    IonSegment,
    IonSegmentButton,
    IonRange,
    IonCheckbox,
    IonButton,
    CommonModule,
    FormsModule
  ]
})
export class QuestionarioPage implements OnInit {

  // Lista de gêneros disponíveis
  genres: string[] = ['Romance', 'Ficção', 'Fantasia', 'Suspense', 'Biografia', 'História'];

  // Lista de tags/temas
  tags = [
    { name: 'Aventura', checked: false },
    { name: 'Mistério', checked: false },
    { name: 'Ciência', checked: false },
    { name: 'Filosofia', checked: false },
    { name: 'Tecnologia', checked: false }
  ];

  // Estado do formulário
  form: any = {
    authors: '',
    format: 'fisico',
    monthlyBooks: 0,
    favoriteBook: '',
    selectedGenres: [] as string[]
  };

  submitting = false;

  constructor() { }

  ngOnInit() { }

  // Alterna seleção de um gênero
  toggleGenre(g: string) {
    const index = this.form.selectedGenres.indexOf(g);
    if (index > -1) {
      this.form.selectedGenres.splice(index, 1);
    } else {
      this.form.selectedGenres.push(g);
    }
  }

  // Verifica se o gênero está selecionado
  isSelected(g: string): boolean {
    return this.form.selectedGenres.includes(g);
  }

  // Submissão do formulário
  submit() {
    this.submitting = true;

    // Aqui você pode enviar os dados para uma API ou salvar localmente
    console.log('Formulário enviado:', {
      genres: this.form.selectedGenres,
      authors: this.form.authors,
      format: this.form.format,
      monthlyBooks: this.form.monthlyBooks,
      tags: this.tags.filter(t => t.checked).map(t => t.name),
      favoriteBook: this.form.favoriteBook
    });

    // Simulação de finalização
    setTimeout(() => {
      this.submitting = false;
      alert('Preferências salvas com sucesso!');
    }, 1000);
  }
}


