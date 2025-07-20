import { Overlay, OverlayModule, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { NgTemplateOutlet } from "@angular/common";
import { Component, DestroyRef, Directive, ElementRef, HostListener, inject, input, model, OnDestroy, OnInit, signal, TemplateRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, Subscription, takeUntil } from "rxjs";

@Directive({
    selector: '[appPopOver]',
    standalone: true,
    providers: [
        OverlayModule
    ]
})
export class PopOverDirective {
    public popOver = input.required<TemplateRef<unknown>>();

    private overlayRef: OverlayRef | null = null;

    private readonly elementRef: ElementRef = inject(ElementRef);
    private readonly overlay: Overlay = inject(Overlay);
    private readonly destroyRef: DestroyRef = inject(DestroyRef);

    private mouseEnterSub: Subscription | null = null;
    private mouseLeaveSub: Subscription | null = null;

    private isHoveringPopOver: boolean = false;
    private isHoveringHost: boolean = false;

    @HostListener('mouseenter')
    onMouseEnter() {
        this.isHoveringHost = true;

        if (this.overlayRef?.hasAttached()) {
            return;
        }

        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withPositions([
                {
                    originX: 'center',
                    originY: 'top',
                    overlayX: 'center',
                    overlayY: 'bottom',
                    offsetY: 0
                },
                {
                    originX: 'center',
                    originY: 'bottom',
                    overlayX: 'center',
                    overlayY: 'top',
                    offsetY: 0
                }
            ]);

        this.overlayRef = this.overlay.create({
            positionStrategy: positionStrategy
        });

        const portal = new ComponentPortal(PopOverComponent);
        const componentRef = this.overlayRef.attach(portal);
        componentRef.instance.contentTemplate.set(this.popOver());

        this.mouseEnterSub = componentRef.instance.mouseEnter$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.isHoveringPopOver = true;
            }
        });

        this.mouseLeaveSub = componentRef.instance.mouseLeave$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.isHoveringPopOver = false;
                setTimeout(() => this.checkShouldHide(), 50);
            }
        });
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.isHoveringHost = false;
        setTimeout(() => this.checkShouldHide(), 50);
    }

    private checkShouldHide() {
        if (!this.isHoveringHost && !this.isHoveringPopOver) {
            setTimeout(() => this.hideAction(), 50);
        }
    }

    private hideAction() {
        this.mouseEnterSub?.unsubscribe();
        this.mouseLeaveSub?.unsubscribe();
        this.overlayRef?.detach();
    }
}

@Component({
    selector: 'app-popover',
    template: `
    <div class="popover-outer">
        <div class="popover-container">
            @if (contentTemplate()) {
            <ng-container *ngTemplateOutlet="contentTemplate()!"></ng-container>
            }
        </div>
    </div>
    `,
    styles: `
    .popover-outer {
        padding: 0.5rem;
        background-color: transparent;
        display: grid;
        place-items: center;
    }

    .popover-container {
        border-radius: 5px;
        background-color: var(--surface-color);
        padding: 0.5rem 1rem;
        box-shadow: 0 10px 20px rgb(0 0 0 / 15%), 0 6px 6px rgb(0 0 0 / 23%);
        opacity: 0;
        animation: fade 250ms forwards ease;
        transform: scale(0.8);
        transform-origin: center;
        font-size: 0.9rem;
        font-weight: 400;
    }

    @keyframes fade {
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    `,
    imports: [
        NgTemplateOutlet
    ]
})
export class PopOverComponent {
    private readonly mouseEnterSub = new Subject<number>();
    private readonly mouseLeaveSub = new Subject<number>();

    public readonly mouseEnter$ = this.mouseEnterSub.asObservable();
    public readonly mouseLeave$ = this.mouseLeaveSub.asObservable();

    public contentTemplate = model<TemplateRef<unknown>>();

    @HostListener('mouseenter')
    onMouseEnter() {
        this.mouseEnterSub.next(1);
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.mouseLeaveSub.next(1);
    }
}

@Directive({
    selector: '[appPopOverClick]',
    standalone: true
})
export class PopOverClickDirective implements OnInit {

    public popOver = input.required<TemplateRef<unknown>>();

    private overlayRef: OverlayRef | null = null;

    private readonly elementRef: ElementRef<HTMLButtonElement> = inject(ElementRef<HTMLButtonElement>);
    private readonly overlay: Overlay = inject(Overlay);
    private readonly destroyRef: DestroyRef = inject(DestroyRef);

    private readonly isOpen = signal(false);

    private close$ = new Subject<void>();

    ngOnInit(): void {
        if (!this.elementRef.nativeElement) {
            return;
        }

        this.elementRef.nativeElement.addEventListener('click', () => {
            if (!this.isOpen()) {
                this.openPopOver();
            }
        });
    }

    private openPopOver() {
        this.isOpen.set(true);

        if (this.overlayRef?.hasAttached()) {
            return;
        }

        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withPositions([
                {
                    originX: 'center',
                    originY: 'top',
                    overlayX: 'center',
                    overlayY: 'bottom',
                    offsetY: 0
                },
                {
                    originX: 'center',
                    originY: 'bottom',
                    overlayX: 'center',
                    overlayY: 'top',
                    offsetY: 0
                }
            ]);

        this.overlayRef = this.overlay.create({
            positionStrategy: positionStrategy
        });

        const portal = new ComponentPortal(PopOverComponent);
        const componentRef = this.overlayRef.attach(portal);
        componentRef.instance.contentTemplate.set(this.popOver());

        this.overlayRef.outsidePointerEvents().pipe(
            takeUntilDestroyed(this.destroyRef),
            takeUntil(this.close$)
        ).subscribe({
            next: e => {
                if (e.type === 'click') {
                    this.isOpen.set(false);
                    this.overlayRef?.detach();
                    this.close$.next();
                }
            }
        });

        this.overlayRef.keydownEvents().pipe(
            takeUntilDestroyed(this.destroyRef),
            takeUntil(this.close$)
        ).subscribe({
            next: e => {
                if (e.key === 'Escape') {
                    this.isOpen.set(false);
                    this.overlayRef?.detach();
                    this.close$.next();
                }
            }
        });

        this.overlayRef.backdropClick().pipe(
            takeUntilDestroyed(this.destroyRef),
            takeUntil(this.close$)
        ).subscribe({
            next: () => {
                this.isOpen.set(false);
                this.overlayRef?.detach();
                this.close$.next();
            }
        });
    }
}