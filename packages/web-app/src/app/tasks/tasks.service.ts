import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../storage/storage.service';
import Fuse from 'fuse.js';

@Injectable({ providedIn: 'root' })
export class TasksService {
  public tasks: Task[] = [];
  public cachedTasks: Task[] = [];

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  getTasksFromApi(): Observable<Task[]> {
    const endpointUrl = '/api/tasks';
    return this.http.get<Task[]>(endpointUrl);
  }

  async getTasksFromStorage(): Promise<void> {
    this.cachedTasks = await this.storageService.getTasks();
    this.filterTask('isArchived');
  }

  filterTask(key: keyof Task): void {
    switch (key) {
      case 'isArchived':
        this.tasks = this.cachedTasks.filter((task) => !task.isArchived);
        break;
      case 'priority':
        this.tasks = this.cachedTasks.filter(
          (task) => task.priority === TaskPriority.HIGH,
        );
        break;
      case 'scheduledDate':
        var today = new Date();
        this.tasks = this.cachedTasks.filter(
          (task) => task.scheduledDate.toDateString() === today.toDateString(),
        );
        break;
      case 'completed':
        this.tasks = this.cachedTasks.filter((task) => !task.completed);
    }
  }

  searchTask(search: string): void {
    if (!search) {
      this.filterTask('isArchived');
      return;
    }

    const fuse: Fuse<Task> = new Fuse(this.cachedTasks, { keys: ['title'] });

    this.tasks = fuse.search(search).map((m) => m.item);
  }
}
