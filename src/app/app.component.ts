import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawerContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { DarkModeToggleComponent } from './components/dark-mode-toggle/dark-mode-toggle.component';
import { ScrollService } from './services/scroll.service';
import { FullScreenLoadingComponent } from './components/full-screen-loading/full-screen-loading.component';

@Component({
  selector: 'app-root',
  imports: [
    DarkModeToggleComponent,
    FullScreenLoadingComponent,
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
export class AppComponent implements OnInit, AfterViewInit {

  private readonly router: Router = inject(Router);
  private readonly scrollService: ScrollService = inject(ScrollService);

  protected readonly drawerIsOpen = signal<boolean>(false);

  protected readonly isLoadingRoute = signal(false);

  readonly scrollableContainer = viewChild<MatDrawerContent>('container');

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

  ngAfterViewInit(): void {
    if (this.scrollableContainer()) {
      this.scrollService.setContainer(this.scrollableContainer()!.getElementRef().nativeElement);
    }
  }

  protected drawerChanged(status: boolean) {
    this.drawerIsOpen.set(status);
  }
}
