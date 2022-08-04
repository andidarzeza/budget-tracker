import { HttpParams } from "@angular/common/http";

export function buildParams(page: number, size: number, sort?: any, optionalParameters?: HttpParams): HttpParams {
    let params = (optionalParameters ?? new HttpParams()).append("page", page?.toString()).append("size", size?.toString());
    return sort ? params.append("sort", sort) : params; 
}