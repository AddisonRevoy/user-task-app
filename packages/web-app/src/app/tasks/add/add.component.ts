import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../../storage/storage.service';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'take-home-add-component',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  standalone: false,
})
export class AddComponent {
  protected addTaskForm: FormGroup = new FormGroup({
    title: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.minLength(10)],
    }),
    description: new FormControl<string | null>(null),
    priority: new FormControl<TaskPriority>(
      { value: TaskPriority.MEDIUM, disabled: false },
      {
        validators: Validators.required,
      },
    ),
    dueDate: new FormControl<Date | null>(null, {
      validators: Validators.required,
    }),
  });
  protected priorities = Object.values(TaskPriority);
  protected saveFailed: boolean = false;
  protected saving: boolean = false;

  constructor(private storageService: StorageService, private router: Router) {}

  onSubmit() {
    this.saveFailed = false;
    this.saving = true;
    let rawTask = this.addTaskForm.getRawValue();

    // references to forms fields are weak, but couldn't
    // find better way to make them explicit
    const newTask: Task = {
      uuid: faker.string.uuid(),
      completed: false,
      description: rawTask.description,
      isArchived: false,
      priority: rawTask.priority,
      scheduledDate: rawTask.dueDate,
      title: rawTask.title,
    };

    // save new task and handle failed save
    this.storageService
      .addTaskItem(newTask)
      .then((_) => this.router.navigateByUrl('/'))
      .catch((err) => {
        this.saving = false;
        this.saveFailed = true;
        console.error(err);
      });
  }

  onCancel(): void {
    this.router.navigateByUrl('/');
  }

  get dueDate() {
    return this.addTaskForm.get('dueDate');
  }

  dueDateError(): string {
    if (!this.dueDate?.errors) {
      return '';
    }

    if (this.dueDate?.errors['required']) {
      return 'A valid date is required';
    } else {
      return '';
    }
  }

  get title() {
    return this.addTaskForm.get('title');
  }

  titleError(): string {
    if (!this.title?.errors) {
      return '';
    }

    if (this.title?.errors['required']) {
      return 'A title is required';
    } else if (this.title?.errors['minlength']) {
      return 'Title must be at least 10 characters';
    } else {
      return '';
    }
  }
}
