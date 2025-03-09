import { Component } from '@angular/core';

import { Task } from '@take-home/shared';
import { take } from 'rxjs';
import { TasksService } from '../tasks.service';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';
import {
  ConfirmationDialogConfig,
  DialogComponent,
} from '../../components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'take-home-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false,
})
export class ListComponent {
  constructor(
    public dialog: MatDialog,
    private storageService: StorageService,
    protected tasksService: TasksService,
    private router: Router,
  ) {
    this.getTaskList();
  }

  onDoneTask(item: Task): void {
    this.openConfirmationDialog(
      {
        acceptLabel: 'Complete',
        cancelLabel: 'Cancel',
        content: `Mark the task '${item.title}' as Complete?`,
        title: 'Complete Task',
      },
      () => {
        item.completed = true;
        this.storageService
          .updateTaskItem(item)
          .then(() => this.tasksService.getTasksFromStorage());
      },
    );
  }

  onReopenTask(item: Task): void {
    this.openConfirmationDialog(
      {
        acceptLabel: 'Reopen',
        cancelLabel: 'Cancel',
        content: `Mark the task '${item.title}' as 'Not Complete'?`,
        title: 'Reopen Task',
      },
      () => {
        item.completed = false;
        this.storageService
          .updateTaskItem(item)
          .then(() => this.tasksService.getTasksFromStorage());
      },
    );
  }

  onDeleteTask(item: Task): void {
    this.openConfirmationDialog(
      {
        acceptLabel: 'Delete',
        cancelLabel: 'Cancel',
        content: `Delete '${item.title}'? \n (Cannot be undone)`,
        title: 'Delete Task',
      },
      () => {
        item.isArchived = true;
        this.storageService
          .updateTaskItem(item)
          .then(() => this.tasksService.getTasksFromStorage());
      },
    );
  }

  onAddTask(): void {
    this.router.navigate(['add']);
  }

  private getTaskList(): void {
    this.tasksService
      .getTasksFromApi()
      .pipe(take(1))
      .subscribe(async (tasks) => {
        tasks.forEach(async (task) => {
          await this.storageService.updateTaskItem(task);
        });
        await this.tasksService.getTasksFromStorage();
      });
  }

  openConfirmationDialog(
    config: ConfirmationDialogConfig,
    callback: () => void,
  ): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '300px',
      data: config,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        callback();
      }
    });
  }
}
