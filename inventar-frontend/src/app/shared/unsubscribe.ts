import { Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export abstract class Unsubscribe implements OnDestroy {
    
    protected unsubscribe$ = new Subject();
    
    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}