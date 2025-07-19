import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

const themeStorageKey: string = 'selected-theme';

@Component({
  selector: 'app-dark-mode-toggle',
  imports: [],
  templateUrl: './dark-mode-toggle.component.html',
  styleUrl: './dark-mode-toggle.component.scss'
})
export class DarkModeToggleComponent {

  private readonly document = inject(DOCUMENT);

  protected readonly selectedTheme = signal('light');

  constructor() {
    const savedTheme = localStorage.getItem(themeStorageKey);
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      this.selectedTheme.set(savedTheme);
      this.setThemeClass();
      return;
    }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)');
    const isLight = window.matchMedia('(prefers-color-scheme: light)');

    if (isDark.matches) {
      this.selectedTheme.set('dark');
    } else if (isLight.matches) {
      this.selectedTheme.set('light');
    }
  }

  toggle() {
    if (this.selectedTheme() === 'light') {
      this.selectedTheme.set('dark');
    } else {
      this.selectedTheme.set('light');
    }
    localStorage.setItem(themeStorageKey, this.selectedTheme());
    this.setThemeClass();
  }

  private setThemeClass() {
    if (this.selectedTheme() === 'light') {
      this.document.body.parentElement?.classList.remove('dark');
      this.document.body.parentElement?.classList.add('light');
    } else if (this.selectedTheme() === 'dark') {
      this.document.body.parentElement?.classList.add('dark');
      this.document.body.parentElement?.classList.remove('light');
    }
  }
}
