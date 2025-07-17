import { Directive, ElementRef, HostListener, inject } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
    selector: '[appIntegerOnly]',
    standalone: true
})
export class IntegerOnlyDirective {

    private readonly el: ElementRef<HTMLInputElement> = inject(ElementRef<HTMLInputElement>);
    private readonly control: NgControl | null = inject(NgControl, { optional: true });

    @HostListener('input')
    onInput() {
        const input = this.el.nativeElement;
        const value = input.value.replace(/\D/g, '');
        input.value = value;
        if (this.control && this.control.control && this.control.control.value !== value) {
            this.control.control.setValue(value);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'e' || event.key === 'E' ||
            event.key === '+' || event.key === '-' ||
            event.key === '.' || event.key === ',') {
            event.preventDefault();
        }
    }
}