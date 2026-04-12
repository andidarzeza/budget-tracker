import { Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export abstract class Unsubscribe implements OnDestroy {
    
    protected unsubscribe$ = new Subject<void>();

    ngOnDestroy() {
        this.unsubscribe$.next(undefined);
        this.unsubscribe$.complete();
    }
}