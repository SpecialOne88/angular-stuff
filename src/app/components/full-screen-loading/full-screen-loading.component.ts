import { Component, computed, inject, Injectable, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  readonly isLoading = signal(false);
  readonly isTransition = signal(false);
  readonly message = signal('Please Wait...');

  public setLoading(loading: boolean, message: string = 'Please Wait...') {
    if (loading) {
      this.message.set(message);
      this.isLoading.set(true);
      this.isTransition.set(false);
    } else {
      this.isTransition.set(true);
      setTimeout(() => this.isLoading.set(false), 1000);
    }
  }
}

@Component({
  selector: 'app-full-screen-loading',
  imports: [
    MatProgressBarModule
  ],
  templateUrl: './full-screen-loading.component.html',
  styleUrl: './full-screen-loading.component.scss'
})
export class FullScreenLoadingComponent {

  private readonly service: LoadingService = inject(LoadingService);

  isLoading = computed(() => this.service.isLoading());
  isAnimating = computed(() => this.service.isTransition());
  message = computed(() => this.service.message());

}
