import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../storage/storage.service';

@Injectable({ providedIn: 'root' })
export class TasksService {
  tasks: Task[] = [];
  cachedTasks: Task[] = [];

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
    this.tasks = [...this.cachedTasks];
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
    this.tasks = this.cachedTasks.filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase()),
    );
  }
}
