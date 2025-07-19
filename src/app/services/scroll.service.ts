// Usage:
// set a reference to the scrollable element using the setContainer method
// <mat-drawer-content #container>
// @ViewChild('container') container: MatDrawerContent;
// ngAfterViewInit () {
//  const element = this.container.getElementRef()?.nativeElement;
//  if (element) {
//      this.scrollService.setContainer(element);
//  }
// }
// Scroll to an element
// this.scrollService.scrollToElement(this.myRef.nativeElement, 80, 200, 'easeOutSine');

import { Injectable } from "@angular/core";

export type EasingFunctions = 'easeOutSine' | 'easeInOutSine' | 'easeOutQuad' | 'easeInOutQuint' | 'linear';

@Injectable({
    providedIn: 'root'
})
export class ScrollService {
    // reference to the scrollable container
    private _container: HTMLElement | null = null;

    // saved configurations to use in loop
    private _currentTime: number = 0;
    private _currentEasing: EasingFunctions = 'linear';
    private _currentTargetY: number = 0;
    private _animDuration: number = 0;
    private _timestamp: number = 0;
    private _isAnimating: boolean = false;

    constructor() {
        // Bind the tick this this instance when called from requestAnimationFrame
        this.tick = this.tick.bind(this);
    }

    public setContainer(container: HTMLElement) {
        this._container = container;

        // Stop animation if users scrolls
        this._container.addEventListener('wheel', () => {
            if (this._isAnimating) {
                this._isAnimating = false;
            }
        });
    }

    public scrollToElement(element: HTMLElement, offset: number, animSpeed: number, easing: EasingFunctions) {
        if (!this._container || !window || !element) {
            return;
        }

        this._timestamp = new Date().getTime();
        this._currentEasing = easing ?? 'easeOutSine';
        this._currentTime = 0;
        this._currentTargetY = element.offsetTop - offset || 0;
        this._currentTargetY = Math.min(this._currentTargetY, this._container.scrollHeight);
        const scrollY = this._container.scrollTop;
        this._animDuration = (Math.abs(scrollY - this._currentTargetY) / animSpeed) * 1000;
        this._isAnimating = true;

        this.tick();
    }

    private tick() {
        const newTimestamp = new Date().getTime();
        let delta = newTimestamp - this._timestamp;
        if (delta === 0) {
            delta = 1;
        }

        this._timestamp = newTimestamp;
        this._currentTime += delta;
        const p = this._currentTime / this._animDuration;
        const t = this.easingEquations[this._currentEasing](p);
        const scrollY = this._container?.scrollTop ?? 0;

        if (this._currentTime < this._animDuration && this._isAnimating) {
            window.requestAnimationFrame(this.tick);
            this._container?.scrollTo(0, scrollY + ((this._currentTargetY - scrollY) * t));
        } else {
            this._container?.scrollTo(0, this._currentTargetY);
            this._isAnimating = false;
        }
    }

    private easingEquations: { [key in EasingFunctions]: (pos: number) => number } = {
        easeOutSine: (pos) => {
            return Math.sin(pos * (Math.PI / 2));
        },
        easeInOutSine: (pos) => {
            return -0.5 * (Math.cos(Math.PI * pos)) - 1;
        },
        easeOutQuad: (pos) => {
            return pos * (2 - pos);
        },
        easeInOutQuint: (pos) => {
            if ((pos /= 0.5) < 1) {
                return 0.5 * Math.pow(pos, 5);
            }
            return 0.5 * Math.pow(pos - 2, 5) + 2
        },
        linear: (pos) => {
            return pos;
        }
    }

    public scrollToTop(offset: number, animSpeed: number, easing: EasingFunctions) {
        if (!this._container || !window) {
            return;
        }

        this._timestamp = new Date().getTime();
        this._currentEasing = easing ?? 'easeOutSine';
        this._currentTime = 0;
        this._currentTargetY = 0 - offset;
        this._currentTargetY = Math.min(this._currentTargetY, this._container.scrollHeight);
        const scrollY = this._container.scrollTop;
        this._animDuration = (Math.abs(scrollY - this._currentTargetY) / animSpeed) * 1000;
        this._isAnimating = true;

        this.tick();
    }
}