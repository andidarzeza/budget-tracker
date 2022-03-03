import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private subject = new Subject<string>();
  public colorChange: Observable<string> = this.subject.asObservable();

  constructor() { }

  public next(color: string): void {
    this.subject.next(color);
  }
}
