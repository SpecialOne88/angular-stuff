import { FocusMonitor } from '@angular/cdk/a11y';
import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, model, OnDestroy, signal, untracked, viewChild } from '@angular/core';
import { AbstractControl, AbstractControlOptions, ControlValueAccessor, FormBuilder, FormControl, FormGroup, FormsModule, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MAT_FORM_FIELD, MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-time-picker',
  imports: [
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MatFormFieldControl, useExisting: TimePickerComponent }
  ],
  host: {
    '[class.timepicker-floating]': 'shouldLabelFloat',
    '[id]': 'id'
  }
})
export class TimePickerComponent implements ControlValueAccessor, MatFormFieldControl<string>, OnDestroy, AfterViewInit {

  static nextId = 0;

  readonly hoursInput = viewChild.required<ElementRef<HTMLInputElement>>('hours');
  readonly minutesInput = viewChild.required<ElementRef<HTMLInputElement>>('minutes');
  readonly autoHours = viewChild.required<MatAutocompleteTrigger>('trigger1');
  readonly autoMinutes = viewChild.required<MatAutocompleteTrigger>('trigger2');

  readonly hoursList: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  readonly minutesList: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  ngControl = inject(NgControl, { optional: true, self: true });

  readonly parts: FormGroup<{
    hours: FormControl<string | null>;
    minutes: FormControl<string | null>;
  }>;

  readonly stateChanges = new Subject<void>();
  readonly touched = signal(false);
  readonly controlType = 'timepicker-input';
  readonly id = `${this.controlType}-${TimePickerComponent.nextId++}`;
  readonly _userAriaDescribedBy = input<string>('', { alias: 'aria-describedby' });
  readonly _placeholder = input<string>('', { alias: 'placeholder' });
  readonly _required = input<boolean, unknown>(false, { alias: 'required', transform: booleanAttribute });
  readonly _disabledByInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly _value = model<string | null>(null, { alias: 'value' });

  onChange = (_: any) => { };
  onTouched = () => { };

  protected readonly _formField = inject(MAT_FORM_FIELD, { optional: true });

  private readonly _focused = signal(false);
  private readonly _disabledByCva = signal(false);
  private readonly _disabled = computed(() => this._disabledByInput() || this._disabledByCva());
  private readonly _focusMonitor = inject(FocusMonitor);
  private readonly _elemenRef = inject<ElementRef<HTMLElement>>(ElementRef);

  get focused(): boolean {
    return this._focused();
  }

  get empty(): boolean {
    const {
      value: { hours, minutes }
    } = this.parts;

    return !hours && !minutes;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get userAriaDescribedBy() {
    return this._userAriaDescribedBy();
  }

  get placeholder() {
    return this._placeholder();
  }

  get required() {
    const req = this.ngControl?.control?.hasValidator(Validators.required) ?? false;
    return req || this._required();
  }

  get disabled() {
    return this._disabled();
  }

  get value() {
    return this._value();
  }

  get errorState() {
    return this.parts.invalid && this.touched();
  }

  constructor() {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    this.parts = inject(FormBuilder).group({
      hours: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2), Validators.pattern('[0-9]{2}'), Validators.min(0), Validators.max(23)]],
      minutes: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2), Validators.pattern('[0-9]{2}'), Validators.min(0), Validators.max(59)]]
    }, {
      validators: [this.validateTime]
    } as AbstractControlOptions);

    effect(() => {
      this._placeholder();
      this._required();
      this._disabled();
      untracked(() => this.stateChanges.next());
    });

    effect(() => {
      if (this._disabled()) {
        untracked(() => this.parts.disable());
      } else {
        untracked(() => this.parts.enable());
      }
    });

    effect(() => {
      const value = this._value();
      untracked(() => {
        if (value && value.length === 5) {
          const split = value.split(':');
          this.parts.setValue({
            hours: split[0],
            minutes: split[1]
          });
        }
      });
    });

    this.parts.statusChanges.pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: () => {
        const val = this.parts.valid ?
          `${this.parts.value.hours}:${this.parts.value.minutes}` :
          null;
        this._updateValue(val);
      }
    });
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elemenRef);
  }

  ngAfterViewInit(): void {
    if (this.ngControl?.control) {
      this.ngControl.control.markAllAsTouched = () => {
        this.touched.set(true);
        this.onTouched();
        this.parts.markAllAsTouched();
      };
    }
  }

  onFocusIn() {
    if (!this._focused()) {
      this._focused.set(true);
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this._elemenRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched.set(true);
      this._focused.set(false);
      this.onTouched();
    }
  }

  autoFocusNext(control: AbstractControl, nextElement?: HTMLInputElement) {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, 'program');
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement) {
    if (!control.value && control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, 'program');
    }
  }

  setDescribedByIds(ids: string[]): void {
    const element = this._elemenRef.nativeElement.querySelector('.timepicker-input-container');
    element?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
    if (!this._focused()) {
      this.hoursInput().nativeElement.focus();
    }
  }

  writeValue(val: string | null): void {
    if (val && val.length === 5) {
      const split = val.split(':');
      if (this.parts.controls['hours'].value !== split[0] || this.parts.controls['minutes'].value !== split[1]) {
        this.parts.setValue({
          hours: split[0],
          minutes: split[1]
        });
      }
    }
    this._updateValue(val);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByCva.set(isDisabled);
  }

  handleInput(control: AbstractControl, nextElement?: HTMLInputElement) {
    this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
  }

  private _updateValue(val: string | null) {
    const current = this._value();
    if (val === current) {
      return;
    }
    this._value.set(val);
  }

  focusElement(elem: EventTarget | null) {
    const input = elem as HTMLInputElement;
    if (input?.ariaLabel === 'Hours') {
      this.autoHours()?.openPanel();
      this.autoMinutes()?.closePanel();
    } else if (input?.ariaLabel === 'Minutes') {
      this.autoHours()?.closePanel();
      this.autoMinutes()?.openPanel();
    }
    input?.select();
  }

  private validateTime(group: AbstractControl) {
    const hours = Number.parseInt(group.get('hours')?.value);
    const minutes = Number.parseInt(group.get('minutes')?.value);

    if (isNaN(hours) || isNaN(minutes)) {
      return { valid: false };
    }

    return null;
  }

  selectAutoComplete(control: AbstractControl, nextElement?: HTMLInputElement) {
    this.onChange(this.value);
    if (nextElement) {
      setTimeout(() => {
        this.autoFocusNext(control, nextElement);
      }, 0);
    }
  }
}
