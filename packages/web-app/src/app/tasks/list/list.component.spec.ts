import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { Task, copyTask, generateTask } from '@take-home/shared';
import { Observable, of } from 'rxjs';
import { ListComponent } from './list.component';
import { TasksService } from '../tasks.service';
import { MatCardModule } from '@angular/material/card';
import { FiltersComponent } from '../filters/filters.component';
import { SearchComponent } from '../search/search.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../storage/storage.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';

const fakeTasks: Task[] = [
  generateTask({ uuid: '3', completed: false }),
  generateTask({ uuid: '4', completed: false }),
];

class MockTasksService {
  // copy tasks for initialization to prevent
  // changes from carrying over bewteen tests
  tasks: Task[] = fakeTasks.map((t) => copyTask(t));
  getTasksFromApi(): Observable<Task[]> {
    return of(fakeTasks.map((t) => copyTask(t)));
  }
  getTasksFromStorage(): Promise<Task[]> {
    return Promise.resolve(fakeTasks.map((t) => copyTask(t)));
  }
  filterTask(): void {
    return;
  }
}

class MockStorageService {
  getTasks(): Promise<Task[]> {
    return Promise.resolve(fakeTasks);
  }
  updateTaskItem(): Promise<void> {
    return Promise.resolve();
  }
}

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent>;
  let loader: HarnessLoader;
  let component: ListComponent;
  let tasksService: TasksService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatToolbarModule,
        MatDividerModule,
        MatDialogModule,
      ],
      declarations: [ListComponent, FiltersComponent, SearchComponent],
      providers: [
        { provide: TasksService, useClass: MockTasksService },
        { provide: StorageService, useClass: MockStorageService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    tasksService = TestBed.inject(TasksService);
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toEqual('My Daily Tasks');
  });

  it(`should display total number of tasks`, () => {
    const total = fixture.debugElement.query(By.css('h3'));
    expect(total.nativeElement.textContent).toEqual(
      `Total Tasks: ${fakeTasks.length}`,
    );
  });

  it(`should display list of tasks as mat-cards`, () => {
    const taskLists = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(taskLists.length).toEqual(fakeTasks.length);
  });

  it(`should navigate to /add when add button is clicked`, async () => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    await addButton.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['add']);
  });

  it(`should mark a task as complete when done button is clicked`, async () => {
    expect(tasksService.tasks[0].completed).toBe(false);
    jest.spyOn(component, 'onDoneTask');

    // mock out confirmation dialog and assume confirm is pressed
    jest
      .spyOn(component, 'openConfirmationDialog')
      .mockImplementation((config, callback) => callback());

    const doneButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="complete-task"]' }),
    );
    await doneButton.click();
    fixture.detectChanges();
    expect(component.onDoneTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].completed).toBe(true);
  });

  it(`should mark a task as incomplete when reopen button is clicked`, async () => {
    tasksService.tasks[0].completed = true;
    expect(tasksService.tasks[0].completed).toBe(true);
    jest.spyOn(component, 'onReopenTask');

    // mock out confirmation dialog and assume confirm is pressed
    jest
      .spyOn(component, 'openConfirmationDialog')
      .mockImplementation((config, callback) => callback());

    const reopenButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="reopen-task"]' }),
    );
    await reopenButton.click();
    reopenButton.click();
    fixture.detectChanges();
    expect(component.onReopenTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].completed).toBe(false);
  });

  it(`should mark a task as archived when delete button is clicked`, async () => {
    expect(tasksService.tasks[0].isArchived).toBe(false);
    jest.spyOn(component, 'onDeleteTask');

    // mock out confirmation dialog and assume confirm is pressed
    jest
      .spyOn(component, 'openConfirmationDialog')
      .mockImplementation((config, callback) => callback());

    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="delete-task"]' }),
    );
    await deleteButton.click();
    expect(component.onDeleteTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].isArchived).toBe(true);
    expect(tasksService.tasks[1].isArchived).toBe(false);
  });

  it(`should not display archived tasks after deleting them`, async () => {
    expect(tasksService.tasks[0].isArchived).toBe(false);
    jest.spyOn(component, 'onDeleteTask');
    jest.spyOn(tasksService, 'filterTask');

    // mock out confirmation dialog and assume confirm is pressed
    jest
      .spyOn(component, 'openConfirmationDialog')
      .mockImplementation((config, callback) => callback());

    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="delete-task"]' }),
    );
    deleteButton.click().then(() => {
      fixture.detectChanges();
      expect(tasksService.filterTask).toHaveBeenCalledWith('isArchived');
      const taskLists = fixture.debugElement.queryAll(By.css('mat-card'));
      expect(taskLists.length).toEqual(fakeTasks.length - 1);
    });
  });
});
