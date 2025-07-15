import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostListener, Inject, input, OnDestroy, OnInit, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { addDays, addMonths, addYears, isValid, parse, setYear } from 'date-fns';
import { enUS, it } from 'date-fns/locale';

export const DEFAULT_LANG_ID = (navigator.languages ? navigator.languages.find(l => l.startsWith('en') || l.startsWith('it')) || 'en' : 'en').substring(0, 2);
export const dateFnsLocale = DEFAULT_LANG_ID === 'it' ? it : enUS;

export const DEFAULT_DATE_FORMATS = {
    parse: {
        dateInput: 'dd/MM/yyyy',
        timeInput: 'HH:mm'
    },
    display: {
        dateInput: 'dd/MM/yyyy',
        monthYearLabel: 'MMMM yyyy',
        dateA11yLabel: 'dd/MM/yyyy',
        monthYearA11yLabel: 'MMMM yyyy',
        timeInput: 'HH:mm',
        timeOptionLabel: 'HH:mm'
    },
};

export const MONTH_DATE_FORMATS = {
    parse: {
        dateInput: 'MM/yyyy',
        timeInput: 'HH:mm'
    },
    display: {
        dateInput: 'MM/yyyy',
        monthYearLabel: 'MMMM yyyy',
        dateA11yLabel: 'MM/yyyy',
        monthYearA11yLabel: 'MMMM yyyy',
        timeInput: 'HH:mm',
        timeOptionLabel: 'HH:mm'
    },
};

export const YEAR_DATE_FORMATS = {
    parse: {
        dateInput: 'yyyy',
        timeInput: 'HH:mm'
    },
    display: {
        dateInput: 'yyyy',
        monthYearLabel: 'MMMM yyyy',
        dateA11yLabel: 'yyyy',
        monthYearA11yLabel: 'MMMM yyyy',
        timeInput: 'HH:mm',
        timeOptionLabel: 'HH:mm'
    },
};

@Directive()
abstract class DateMaskDirective implements OnInit, OnDestroy {

    private _buttonContainer: HTMLElement | null = null;

    protected readonly _el: ElementRef<HTMLInputElement>;
    protected readonly _control: NgControl;
    protected readonly _document: Document;

    public showButtons = input<boolean>(true);

    constructor(
        el: ElementRef<HTMLInputElement>,
        control: NgControl,
        document: Document
    ) {
        this._el = el;
        this._control = control;
        this._document = document;
    }

    ngOnInit(): void {
        if (this.showButtons()) {
            this.createButtons();
        }
    }

    ngOnDestroy(): void {
        if (this._buttonContainer && this._buttonContainer.parentElement) {
            this._buttonContainer.parentElement.removeChild(this._buttonContainer);
        }
    }

    @HostListener('input')
    onInput() {
        this.handleInput();
    }

    public handleInput() { }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowUp') {
            this.plusClick();
        } else if (event.key === 'ArrowDown') {
            this.minusClick();
        } else if (event.key === 'Delete') {
            this.handleDeleteKey();
        } else if (event.key === 'Backspace') {
            this.handleBackspaceKey();
        }
    }

    @HostListener('blur')
    onBlur() {
        this.handleBlur();
    }

    plusClick(): void { }

    minusClick(): void { }

    handleDeleteKey() { }

    handleBackspaceKey() { }

    private createButtons() {
        const parent = this._el.nativeElement.parentElement;
        if (!parent) {
            return;
        }

        parent.style.position = 'relative';

        this._buttonContainer = this._document.createElement('div');
        this._buttonContainer.classList.add('date-buttons-container');

        const btnPlus = this._document.createElement('button');
        btnPlus.innerText = '+';
        btnPlus.setAttribute('type', 'button');
        btnPlus.style.lineHeight = '1';
        btnPlus.addEventListener('click', (e) => this.plusClickEvent(e));

        const btnMinus = this._document.createElement('button');
        btnMinus.innerText = '−';
        btnMinus.setAttribute('type', 'button');
        btnMinus.style.lineHeight = '1';
        btnMinus.addEventListener('click', (e) => this.minusClickEvent(e));

        this._buttonContainer.appendChild(btnPlus);
        this._buttonContainer.appendChild(btnMinus);

        parent.appendChild(this._buttonContainer);
    }

    private plusClickEvent(e: Event) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.plusClick();
    }

    private minusClickEvent(e: Event) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.minusClick();
    }

    handleBlur() {
        if (!this._control.control?.value) {
            return;
        }

        let date: Date | undefined = undefined;
        if (this._control.control.value && isValid(this._control.control.value)) {
            date = this._control.control.value as Date;
        }

        if (!date) {
            return;
        }

        let year = date.getFullYear();
        if (year < 100) {
            const now = new Date();
            year += 2000;
            let newDate = setYear(date, year);
            if (newDate >= now) {
                newDate = addYears(newDate, -100);
            }
            this._control.control.setValue(newDate);
        }
    }
}

@Directive({
    selector: '[appDateMaskFull]',
    standalone: true,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DEFAULT_DATE_FORMATS }
    ]
})
export class DateMaskFullDirective extends DateMaskDirective {

    constructor(
        el: ElementRef<HTMLInputElement>,
        control: NgControl,
        @Inject(DOCUMENT) document: Document) {
        super(el, control, document);
    }

    override plusClick(): void {
        this.addDaysToDate(1);
    }

    override minusClick(): void {
        this.addDaysToDate(-1);
    }

    private addDaysToDate(days: number) {
        let date: Date | undefined = undefined;
        if (this._control.control?.value && isValid(this._control.control.value)) {
            date = this._control.control.value as Date;
        } else {
            const now = new Date();
            date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        }
        date = addDays(date, days);
        this._control.control?.setValue(date);
    }

    override handleInput(): void {
        const input = this._el.nativeElement;
        const position = input.selectionStart;

        const replace = position !== input.value.length;

        let value = input.value.replace(/\D/g, '');
        if (value.length > 8) {
            value = value.substring(0, 8);
        }

        let finalValue = '';
        if (value.length >= 1) {
            finalValue = value.substring(0, 2);
        }

        if (value.length >= 3) {
            finalValue += '/' + value.substring(2, 4);
        }

        if (value.length >= 5) {
            finalValue += '/' + value.substring(4, 8);
        }

        input.value = finalValue;

        if (replace) {
            input.selectionStart = position;
            input.selectionEnd = position;
        }

        let date: Date | undefined = undefined;
        if (finalValue.length === 10) {
            date = parse(finalValue, 'dd/MM/yyyy', new Date());
        }

        if (this._control && this._control.control && date && isValid(date)) {
            this._control.control.setValue(date);
        }
    }

    override handleDeleteKey(): void {
        const input = this._el.nativeElement;
        if (input.selectionStart === 2 || input.selectionStart === 5) {
            input.selectionStart = input.selectionStart + 1;
        }
    }

    override handleBackspaceKey(): void {
        const input = this._el.nativeElement;
        if (input.selectionStart === 3 || input.selectionStart === 6) {
            input.selectionStart = input.selectionStart - 2;
        }
    }
}

@Directive({
    selector: '[appDateMaskMonth]',
    standalone: true,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: MONTH_DATE_FORMATS }
    ]
})
export class DateMaskMonthDirective extends DateMaskDirective {

    constructor(
        el: ElementRef<HTMLInputElement>,
        control: NgControl,
        @Inject(DOCUMENT) document: Document) {
        super(el, control, document);
    }

    override plusClick(): void {
        this.addMonthsToDate(1);
    }

    override minusClick(): void {
        this.addMonthsToDate(-1);
    }

    private addMonthsToDate(months: number) {
        let date: Date | undefined = undefined;
        if (this._control.control?.value && isValid(this._control.control.value)) {
            date = this._control.control.value as Date;
        } else {
            const now = new Date();
            date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        }
        date = addMonths(date, months);
        this._control.control?.setValue(date);
    }

    override handleInput(): void {
        const input = this._el.nativeElement;
        const position = input.selectionStart;

        const replace = position !== input.value.length;

        let value = input.value.replace(/\D/g, '');
        if (value.length > 6) {
            value = value.substring(0, 6);
        }

        let finalValue = '';
        if (value.length >= 1) {
            finalValue = value.substring(0, 2);
        }

        if (value.length >= 3) {
            finalValue += '/' + value.substring(2, 6);
        }

        input.value = finalValue;

        if (replace) {
            input.selectionStart = position;
            input.selectionEnd = position;
        }

        let date: Date | undefined = undefined;
        if (finalValue.length === 7) {
            date = parse(finalValue, 'MM/yyyy', new Date());
        }

        if (this._control && this._control.control && date && isValid(date)) {
            this._control.control.setValue(date);
        }
    }

    override handleDeleteKey(): void {
        const input = this._el.nativeElement;
        if (input.selectionStart === 2) {
            input.selectionStart = input.selectionStart + 1;
        }
    }

    override handleBackspaceKey(): void {
        const input = this._el.nativeElement;
        if (input.selectionStart === 3) {
            input.selectionStart = input.selectionStart - 2;
        }
    }
}

@Directive({
    selector: '[appDateMaskYear]',
    standalone: true,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: YEAR_DATE_FORMATS }
    ]
})
export class DateMaskYearDirective extends DateMaskDirective {

    constructor(
        el: ElementRef<HTMLInputElement>,
        control: NgControl,
        @Inject(DOCUMENT) document: Document) {
        super(el, control, document);
    }

    override plusClick(): void {
        this.addYearsToDate(1);
    }

    override minusClick(): void {
        this.addYearsToDate(-1);
    }

    private addYearsToDate(days: number) {
        let date: Date | undefined = undefined;
        if (this._control.control?.value && isValid(this._control.control.value)) {
            date = this._control.control.value as Date;
        } else {
            const now = new Date();
            date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        }
        date = addYears(date, days);
        this._control.control?.setValue(date);
    }

    override handleInput(): void {
        const input = this._el.nativeElement;
        const position = input.selectionStart;

        let value = input.value.replace(/\D/g, '');
        if (value.length > 4) {
            value = value.substring(0, 4);
        }

        input.value = value;

        let date: Date | undefined = undefined;
        if (value.length === 4) {
            date = parse(value, 'yyyy', new Date());
        }

        if (this._control && this._control.control && date && isValid(date)) {
            this._control.control.setValue(date);
        }
    }

    override handleBlur(): void {
        if (!this._control.control?.value) {
            return;
        }

        let date: Date | undefined = undefined;
        if (this._control.control.value && isValid(this._control.control.value)) {
            date = this._control.control.value as Date;
        }

        if (!date) {
            return;
        }

        let year = date.getFullYear();
        const now = new Date();
        if (year < 100) {
            year += 2000;
            let newDate = setYear(date, year);
            if (newDate >= now) {
                newDate = addYears(newDate, -100);
            }
            this._control.control.setValue(newDate);
        } else if (this._el.nativeElement.value.length === 2) {
            const yearConcat = Number.parseInt('20' + this._el.nativeElement.value);
            let newDate = setYear(date, yearConcat);
            if (newDate >= now) {
                newDate = addYears(newDate, -100);
            }
            this._control.control.setValue(newDate);
        }
    }
}