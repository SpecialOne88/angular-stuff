import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { map, Observable, startWith } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { LazyAccordionComponent, LazyContentDirective } from '../lazy-accordion/lazy-accordion.component';
import { DateMaskFullDirective, DateMaskMonthDirective, DateMaskYearDirective } from '../../utils/date-utils';

interface Food {
  value: string;
  viewValue: string;
}

export interface UserData {
  id: string;
  name: string;
  progress: string;
  fruit: string;
}

/** Constants used to fill up our data base. */
const FRUITS: string[] = [
  'blueberry',
  'lychee',
  'kiwi',
  'mango',
  'peach',
  'lime',
  'pomegranate',
  'pineapple',
];
const NAMES: string[] = [
  'Maia',
  'Asher',
  'Olivia',
  'Atticus',
  'Amelia',
  'Jack',
  'Charlotte',
  'Theodore',
  'Isla',
  'Oliver',
  'Isabella',
  'Jasper',
  'Cora',
  'Levi',
  'Violet',
  'Arthur',
  'Mia',
  'Thomas',
  'Elizabeth',
];

@Component({
  selector: 'app-playground',
  imports: [
    AsyncPipe,
    DateMaskFullDirective,
    DateMaskMonthDirective,
    DateMaskYearDirective,
    FormsModule,
    JsonPipe,
    LazyAccordionComponent,
    LazyContentDirective,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSortModule,
    MatStepperModule,
    MatTabsModule,
    MatTableModule,
    MatTimepickerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TimePickerComponent
  ],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
  providers: [
  ]
})
export class PlaygroundComponent implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);

  readonly toppings = this._formBuilder.group({
    pepperoni: false,
    extracheese: false,
    mushroom: false,
  });

  value = 'Clear me';

  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]> = this.myControl.valueChanges.pipe(
    startWith(''),
    map(value => this._filter(value || '')),
  );;

  private _bottomSheet = inject(MatBottomSheet);

  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  readonly dialog = inject(MatDialog);

  readonly panelOpenState = signal(false);

  private _snackBar = inject(MatSnackBar);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;

  displayedColumns: string[] = ['id', 'name', 'progress', 'fruit'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dateFullCtrl = new FormControl<Date | null>(null);
  dateMonthCtrl = new FormControl<Date | null>(null);
  dateYearCtrl = new FormControl<Date | null>(null);

  constructor() {
    // Create 100 users
    const users = Array.from({ length: 100 }, (_, k) => createNewUser(k + 1));

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(users);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnInit() {
  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetOverviewExampleSheet);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  time = new FormControl<string>('', [Validators.required]);

  setMonthAndYear(date: Date, datePicker: MatDatepicker<Date>) {
    const newValue = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
    this.dateMonthCtrl.setValue(newValue);
    datePicker.close();
  }

  setYear(date: Date, datePicker: MatDatepicker<Date>) {
    const newValue = new Date(date.getFullYear(), 0, 1, 0, 0, 0);
    this.dateYearCtrl.setValue(newValue);
    datePicker.close();
  }
}

function createNewUser(id: number): UserData {
  const name =
    NAMES[Math.round(Math.random() * (NAMES.length - 1))] +
    ' ' +
    NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) +
    '.';

  return {
    id: id.toString(),
    name: name,
    progress: Math.round(Math.random() * 100).toString(),
    fruit: FRUITS[Math.round(Math.random() * (FRUITS.length - 1))],
  };
}

@Component({
  selector: 'bottom-sheet-overview-example-sheet',
  template: `
  <mat-nav-list>
    <a href="https://keep.google.com/" mat-list-item (click)="openLink($event)">
      <span matListItemTitle>Google Keep</span>
      <span matLine>Add to a note</span>
    </a>
    <a href="https://docs.google.com/" mat-list-item (click)="openLink($event)">
      <span matListItemTitle>Google Docs</span>
      <span matLine>Embed in a document</span>
    </a>
    <a href="https://plus.google.com/" mat-list-item (click)="openLink($event)">
      <span matListItemTitle>Google Plus</span>
      <span matLine>Share with your friends</span>
    </a>
    <a href="https://hangouts.google.com/" mat-list-item (click)="openLink($event)">
      <span matListItemTitle>Google Hangouts</span>
      <span matLine>Show to your coworkers</span>
    </a>
  </mat-nav-list>
  `,
  imports: [
    MatListModule
  ],
})
export class BottomSheetOverviewExampleSheet {
  private _bottomSheetRef = inject<MatBottomSheetRef<BottomSheetOverviewExampleSheet>>(MatBottomSheetRef);

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  template: `
  <h2 mat-dialog-title>Install Angular</h2>
  <mat-dialog-content class="mat-typography">
    <h3>Develop across all platforms</h3>
    <p>Learn one way to build applications with Angular and reuse your code and abilities to build
      apps for any deployment target. For web, mobile web, native mobile and native desktop.</p>

    <h3>Speed &amp; Performance</h3>
    <p>Achieve the maximum speed possible on the Web Platform today, and take it further, via Web
      Workers and server-side rendering. Angular puts you in control over scalability. Meet huge
      data requirements by building data models on RxJS, Immutable.js or another push-model.</p>

    <h3>Incredible tooling</h3>
    <p>Build features quickly with simple, declarative templates. Extend the template language with
      your own components and use a wide array of existing components. Get immediate Angular-specific
      help and feedback with nearly every IDE and editor. All this comes together so you can focus
      on building amazing apps rather than trying to make the code work.</p>

    <h3>Loved by millions</h3>
    <p>From prototype through global deployment, Angular delivers the productivity and scalable
      infrastructure that supports Google's largest applications.</p>

    <h3>What is Angular?</h3>

    <p>Angular is a platform that makes it easy to build applications with the web. Angular
      combines declarative templates, dependency injection, end to end tooling, and integrated
      best practices to solve development challenges. Angular empowers developers to build
      applications that live on the web, mobile, or the desktop</p>

    <h3>Architecture overview</h3>

    <p>Angular is a platform and framework for building client applications in HTML and TypeScript.
    Angular is itself written in TypeScript. It implements core and optional functionality as a
    set of TypeScript libraries that you import into your apps.</p>

    <p>The basic building blocks of an Angular application are NgModules, which provide a compilation
    context for components. NgModules collect related code into functional sets; an Angular app is
    defined by a set of NgModules. An app always has at least a root module that enables
    bootstrapping, and typically has many more feature modules.</p>

    <p>Components define views, which are sets of screen elements that Angular can choose among and
    modify according to your program logic and data. Every app has at least a root component.</p>

    <p>Components use services, which provide specific functionality not directly related to views.
    Service providers can be injected into components as dependencies, making your code modular,
    reusable, and efficient.</p>

    <p>Both components and services are simply classes, with decorators that mark their type and
    provide metadata that tells Angular how to use them.</p>

    <p>The metadata for a component class associates it with a template that defines a view. A
    template combines ordinary HTML with Angular directives and binding markup that allow Angular
    to modify the HTML before rendering it for display.</p>

    <p>The metadata for a service class provides the information Angular needs to make it available
    to components through Dependency Injection (DI).</p>

    <p>An app's components typically define many views, arranged hierarchically. Angular provides
    the Router service to help you define navigation paths among views. The router provides
    sophisticated in-browser navigational capabilities.</p>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Install</button>
  </mat-dialog-actions>
  `,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogContentExampleDialog { }
