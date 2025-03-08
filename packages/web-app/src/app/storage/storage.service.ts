import { Injectable } from '@angular/core';
import { openDB } from 'idb';
import { from, Observable } from 'rxjs';

import { Task, TaskPriority } from '@take-home/shared';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private dbName = 'take-home';
  private dbVersion = 1;
  private tasks = 'tasks';

  constructor() {
    this.restoreIndexedDB();
    // this.resetIndexedDB();
  }

  // Create / Update
  async addTaskItem(item: Task) {
    await this.addTask(item);
  }

  async updateTaskItem(item: Task) {
    await this.updateTask(item);
  }

  // Read
  getTask(id: string | null): Promise<Task> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db
        .get(`${this.tasks}`, id ? id : '')
        .then((result) => StorageService.parseTask(result));
    });
  }

  getTasks(): Promise<Task[]> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db
        .getAll(`${this.tasks}`)
        .then((result) => result.map((r) => StorageService.parseTask(r)));
    });
  }

  getItem<T>(storeName: string, id: string | null): Observable<T> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return from(
      dbPromise.then((db) => {
        return db.get(storeName, id ? id : '');
      }),
    );
  }

  getItems<T>(storeName: string): Promise<T[]> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.getAll(storeName);
    });
  }

  async resetIndexedDB() {
    const tasks = this.clearTasks();
    await Promise.allSettled([tasks]).then(() => {
      this.restoreIndexedDB();
    });
  }

  private addTask(item: Task) {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.add(this.tasks, item, item.uuid);
    });
  }

  private updateTask(item: Task) {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.put(this.tasks, item, item.uuid);
    });
  }

  private clearTasks() {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.clear(`${this.tasks}`);
    });
  }

  private restoreIndexedDB(tasks = `${this.tasks}`) {
    openDB(`${this.dbName}`, this.dbVersion, {
      upgrade(db) {
        db.createObjectStore(tasks).createIndex('uuid', 'uuid', {
          unique: true,
        });
      },
    });
  }

  /**
   * Parses a raw data object from the DB into a Task.
   * Needed to properly read date values.
   */
  private static parseTask(value: any): Task {
    return {
      uuid: value.uuid,
      title: value.title,
      description: value.description,
      priority: value.priority as TaskPriority,
      completed: value.completed,
      isArchived: value.isArchived,
      scheduledDate: new Date(value.scheduledDate),
    };
  }
}
