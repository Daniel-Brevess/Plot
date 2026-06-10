import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  constructor(private toastController: ToastController) {}

  async sucesso(message: string) {
    await this.show(message, 'success');
  }

  async erro(message: string) {
    await this.show(message, 'danger');
  }

  async info(message: string) {
    await this.show(message, 'medium');
  }

  private async show(message: string, color: 'success' | 'danger' | 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      color
    });

    await toast.present();
  }
}
