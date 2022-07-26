import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private editSubject = new Subject();
  editObservable = this.editSubject.asObservable();
  constructor() { }

  edit(item: string): void {
    this.editSubject.next(item);
  }
}
