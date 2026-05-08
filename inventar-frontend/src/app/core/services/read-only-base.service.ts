import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export abstract class ReadOnlyBaseService<E> {
    readonly abstract API_URl: string;

    /** Public for backwards compatibility — subclasses still pass `this.http` to super(). */
    readonly http = inject(HttpClient);

    findAll(params: HttpParams): Observable<any> {
        return this.http.get(this.API_URl, { params });
    }

    findOne(id: string): Observable<E> {
        return this.http.get<E>(`${this.API_URl}/${id}`);
    }
}
