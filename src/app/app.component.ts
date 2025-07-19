import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { DarkModeToggleComponent } from './components/dark-mode-toggle/dark-mode-toggle.component';

@Component({
  selector: 'app-root',
  imports: [
    DarkModeToggleComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  private readonly router: Router = inject(Router);

  protected readonly drawerIsOpen = signal<boolean>(false);

  protected readonly isLoadingRoute = signal(false);

  private readonly routeEvents$ = this.router.events.pipe(
    takeUntilDestroyed(),
    tap(x => {
      if (x instanceof NavigationStart) {
        this.isLoadingRoute.set(true);
      } else if (x instanceof NavigationEnd || x instanceof NavigationCancel || x instanceof NavigationError) {
        this.isLoadingRoute.set(false);
      }
    })
  );

  ngOnInit(): void {
    this.routeEvents$.subscribe();  
  }

  protected drawerChanged(status: boolean) {
    this.drawerIsOpen.set(status);
  }
}
