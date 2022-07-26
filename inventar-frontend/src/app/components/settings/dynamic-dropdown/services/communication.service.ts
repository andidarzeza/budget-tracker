import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private selectAllSubject = new Subject();
  selectAllObservable = this.selectAllSubject.asObservable();
  
  constructor() { }

  toggleSelectAll(selectAll: boolean) {
    this.selectAllSubject.next(selectAll);
  }
}
