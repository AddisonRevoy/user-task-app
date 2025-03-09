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

  public activeFilters: (keyof Task)[] = ['isArchived'];

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
    this.activeFilters = ['isArchived'];
    this.applyActiveFilters();
  }

  filterTask(key: keyof Task): void {
    this.activeFilters = ['isArchived', key];

    this.applyActiveFilters();
  }

  /**
   * Apply active filters sequentially to loaded tasks.
   */
  public applyActiveFilters(): void {
    this.tasks = [...this.cachedTasks];

    if (this.activeFilters.indexOf('isArchived') >= 0) {
      this.tasks = this.tasks.filter((task) => !task.isArchived);
    }

    if (this.activeFilters.indexOf('priority') >= 0) {
      this.tasks = this.tasks.filter(
        (task) => task.priority === TaskPriority.HIGH,
      );
    }

    if (this.activeFilters.indexOf('scheduledDate') >= 0) {
      var today = new Date();
      this.tasks = this.tasks.filter(
        (task) => task.scheduledDate.toDateString() === today.toDateString(),
      );
    }

    if (this.activeFilters.indexOf('completed') >= 0) {
      this.tasks = this.tasks.filter((task) => !task.completed);
    }
  }

  searchTask(search: string): void {
    this.applyActiveFilters();

    if (search) {
      const fuse: Fuse<Task> = new Fuse(this.cachedTasks, { keys: ['title'] });
      this.tasks = fuse.search(search).map((m) => m.item);
    }
  }
}
