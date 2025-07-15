import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { AfterContentInit, ChangeDetectionStrategy, Component, signal, Directive, contentChild, inject, ViewContainerRef, input, TemplateRef } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lazy-accordion',
  imports: [
    MatExpansionModule,
    MatIconModule,
    PortalModule
  ],
  templateUrl: './lazy-accordion.component.html',
  styleUrl: './lazy-accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyAccordionComponent implements AfterContentInit {

  private readonly _showContent = signal(false);
  private lazyContent = contentChild<LazyContentDirective>(LazyContentDirective);
  portal: TemplatePortal | null = null;
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly showContent = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly hideToggle = input<boolean>(false);
  readonly preventClose = input<boolean>(false);
  readonly title = input.required<string>();
  readonly icon = input<string>('');
  readonly iconPath = input<string>('');
  readonly description = input<string>('');
  readonly isEager = input<boolean>(false);

  ngAfterContentInit(): void {
    if (this.isEager()) {
      this.lazyRender();
    }
  }

  protected openEvent() {
    this._showContent.set(true);
    this.lazyRender();
  }

  private lazyRender() {
    if ((this.lazyContent() && this._showContent()) || this.isEager()) {
      if (!this.portal) {
        this.portal = new TemplatePortal(
          this.lazyContent()!.template,
          this.viewContainerRef
        );
      }
    } else {
      this.portal = null;
    }
  }
}

@Directive({
  selector: 'ng-template[appLazyContent]',
  standalone: true
})
export class LazyContentDirective {
  public readonly template = inject(TemplateRef<unknown>);
}
