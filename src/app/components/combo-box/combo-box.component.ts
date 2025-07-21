import { AfterContentInit, AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, computed, ContentChildren, DestroyRef, effect, ElementRef, inject, input, model, OnDestroy, QueryList, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormsModule, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_FORM_FIELD, MatFormFieldControl } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { distinctUntilChanged, Subject, tap } from 'rxjs';

@Component({
  selector: 'app-combo-box',
  imports: [
    FormsModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './combo-box.component.html',
  styleUrl: './combo-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MatFormFieldControl, useExisting: ComboBoxComponent }
  ],
  host: {
    '[id]': 'id'
  }
})
export class ComboBoxComponent implements ControlValueAccessor, MatFormFieldControl<string>, OnDestroy, AfterViewInit, AfterContentInit {

  static nextId = 0;

  ngControl = inject(NgControl, { optional: true, self: true });

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  valueCtrl = new FormControl<string>('');
  filterCtrl = new FormControl<string | null>(null);

  readonly stateChanges = new Subject<void>();
  readonly touched = signal(false);
  readonly controlType = 'combo-box';
  readonly id = `${this.controlType}-${ComboBoxComponent.nextId++}`;
  readonly _userAriaDescribedBy = input<string>('', { alias: 'aria-describedby' });
  readonly _placeholder = input<string>('', { alias: 'placeholder' });
  readonly _required = input<boolean, unknown>(false, { alias: 'required', transform: booleanAttribute });
  readonly _disabledByInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly _value = model<string | null>(null, { alias: 'value' });

  protected readonly _formField = inject(MAT_FORM_FIELD, { optional: true });

  private readonly _focused = signal(false);
  private readonly _disabledByCva = signal(false);
  private readonly _disabled = computed(() => this._disabledByInput() || this._disabledByCva());
  private readonly _elemenRef = inject<ElementRef<HTMLElement>>(ElementRef);

  filteredOptions = signal<MatOption[]>([]);
  allOptions = signal<MatOption[]>([]);

  @ContentChildren(MatOption, { descendants: true }) contentOptions!: QueryList<MatOption>;

  readonly select = viewChild.required<MatSelect>('select');

  get value() {
    return this._value();
  }

  get placeholder() {
    return this._placeholder();
  }

  get focused(): boolean {
    return this._focused();
  }

  get empty(): boolean {
    const v = this.ngControl?.control?.value as string
    return !v || v.length === 0;
  }

  get shouldLabelFloat() {
    console.log(this.focused, this.empty);
    return this.focused || !this.empty;
  }

  get required() {
    const req = this.ngControl?.control?.hasValidator(Validators.required) ?? false;
    return req || this._required();
  }

  get disabled() {
    return this._disabled();
  }

  get errorState() {
    return (this.ngControl?.control?.invalid ?? true) && this.touched();
  }

  autofilled?: boolean | undefined;

  get userAriaDescribedBy() {
    return this._userAriaDescribedBy();
  }

  disableAutomaticLabeling?: boolean | undefined;

  onChange = (_: any) => { };
  onTouched = () => { };

  constructor() {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    effect(() => {
      this._placeholder();
      this._required();
      this._disabled();
      untracked(() => this.stateChanges.next());
    });

    this.filterCtrl.valueChanges.pipe(
      takeUntilDestroyed(),
      distinctUntilChanged(),
      tap(x => {
        if (!x) {
          this.filteredOptions.set([...this.allOptions()]);
        } else {
          this.filteredOptions.set(this.allOptions().filter(o => o.viewValue.toUpperCase().includes(x.toUpperCase()) || o.value === this.valueCtrl.value));
        }
      })
    ).subscribe();

    this.valueCtrl.valueChanges.pipe(
      takeUntilDestroyed(),
      distinctUntilChanged(),
      tap(x => {
        if (this.ngControl?.control && this.ngControl.control.value !== x) {
          this.ngControl.control.setValue(x);
        }
      })
    ).subscribe();
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

  setDescribedByIds(ids: string[]): void {
    const element = this._elemenRef.nativeElement;
    element?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
    this.select().open();
  }

  ngAfterViewInit(): void {
    this.select().openedChange.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(x => {
        if (!x) {
          this.filterCtrl.reset();
        }
      })
    ).subscribe();

    this.valueCtrl.setValue(this.ngControl?.control?.value);
    this.ngControl?.control?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      distinctUntilChanged(),
      tap(x => {
        if (this.valueCtrl.value !== x) {
          this.valueCtrl.setValue(x);
        }
      })
    ).subscribe();
  }

  ngAfterContentInit(): void {
    this.allOptions.set([...this.contentOptions]);
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
  }

  writeValue(obj: any): void {
    this._updateValue(obj);
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

  private _updateValue(val: string | null) {
    console.log(val);
    const current = this._value();
    if (val === current) {
      return;
    }
    this._value.set(val);
  }
}
