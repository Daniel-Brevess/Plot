import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class EditProfilePage {

  user = {
    nome: '',
    email: '',
    senha: ''
  };

  foto: string = 'https://i.pravatar.cc/150';

  ngOnInit() {
    const data = localStorage.getItem('user');
    const fotoSalva = localStorage.getItem('foto');

    if (data) {
      this.user = JSON.parse(data);
    }

    if (fotoSalva) {
      this.foto = fotoSalva;
    }
  }

  salvar() {
    localStorage.setItem('user', JSON.stringify(this.user));
    localStorage.setItem('foto', this.foto);

    alert('Perfil atualizado!');
  }

  selecionarFoto() {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.foto = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }
}
