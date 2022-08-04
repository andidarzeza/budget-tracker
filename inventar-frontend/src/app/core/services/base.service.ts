import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ReadOnlyBaseService } from "./read-only-base.service";

export abstract class BaseService<E> extends ReadOnlyBaseService<E> {

    constructor(public http: HttpClient) {
        super(http);
    }

    save(entity: E): Observable<E> {
        return this.http.post<E>(this.API_URl, entity);
    }

    update(id: string, entity: E): Observable<E> {
        return this.http.put<E>(`${this.API_URl}/${id}`, entity);
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${this.API_URl}/${id}`);
    }
}