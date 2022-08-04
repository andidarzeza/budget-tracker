import { OnDestroy, OnInit } from "@angular/core";

export interface EntityOperation<T> extends OnInit, OnDestroy{
    query(): void;
    delete(id: string): void;
}