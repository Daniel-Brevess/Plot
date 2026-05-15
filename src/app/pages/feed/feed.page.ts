import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline } from 'ionicons/icons';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, CommonModule]
})
export class FeedPage {
  
  // Mock dos dados baseados na imagem
  livros = [
    {
      titulo: 'O Poder do Hábito',
      capa: 'assets/covers/poder_habito.jpg',
      descricao: 'Durante os últimos dois anos, uma jovem transformou quase todos os aspectos de sua vida.'
    },
    {
      titulo: 'Hábitos Atômicos',
      capa: 'assets/covers/habitos_atomicos.jpg',
      descricao: 'Não importa quais sejam seus objetivos, Hábitos Atômicos oferece um método eficaz para você se aprimorar.'
    },
    {
      titulo: 'As coisas que você só vê...',
      capa: 'assets/covers/coisas_desacelera.jpg',
      descricao: 'Ilustrado com extrema delicadeza, ele nos ajuda a entender nossos relacionamentos, nosso trabalho...'
    }
  ];

  constructor() {
    addIcons({ starOutline });
  }

  irParaExplorar() { /* navegação */ }
  irParaPerfil() { /* navegação */ }
}
