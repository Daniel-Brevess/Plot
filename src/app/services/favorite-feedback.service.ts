import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root'
})
export class FavoriteFeedbackService {
  async favorite() {
    this.playTone(880, 0.2);
    await this.vibrate(true);
  }

  async remove() {
    this.playTone(420, 0.12);
    await this.vibrate(false);
  }

  private async vibrate(favoritando: boolean) {
    if (Capacitor.isNativePlatform()) {
      try {
        if (favoritando) {
          await Haptics.notification({ type: NotificationType.Success });
        } else {
          await Haptics.impact({ style: ImpactStyle.Medium });
        }

        return;
      } catch (error) {
        console.warn('Feedback haptico nativo nao suportado:', error);
      }
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(favoritando ? [70, 45, 90] : 80);
    }
  }

  private playTone(frequency: number, duration: number) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      setTimeout(() => ctx.close(), Math.ceil((duration + 0.08) * 1000));
    } catch (error) {
      console.warn('Feedback de som nao suportado:', error);
    }
  }
}
