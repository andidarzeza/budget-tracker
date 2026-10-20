import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { EntityType } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

/** A record the server just stored, shaped like a row of its list page. */
export interface SavedRecord {
  entity: EntityType;
  record: { id: string };
  created: boolean;
}

export interface BackgroundSave<T> {
  entity: EntityType;
  request: Observable<T>;
  created: boolean;
  /** Turns the server's response into the row its list shows (e.g. adds the category name). */
  toRow: (saved: T) => { id: string };
  success: string;
  failure: string;
}

/** A save no list has shown yet is handed to a list opened up to this long after it. */
const UNSEEN_FOR_MS = 10_000;

/**
 * Saves that outlive their form. On phones the add / edit pages go straight
 * back to the list when Save is tapped; the request finishes here, and the
 * list (`BaseTable`) adds or updates the row: when `saved$` fires, or when
 * it opens if the save landed first.
 */
@Injectable({ providedIn: 'root' })
export class BackgroundSaveService {
  private readonly toaster = inject(ToastrService);
  private readonly accountService = inject(AccountService);
  private readonly saved = new Subject<EntityType>();
  /** Emits the kind of record whenever one is saved; lists then call `takeUnseen`. */
  readonly saved$ = this.saved.asObservable();
  /** Saves waiting for their list. Kept because a fast save often lands
   *  before the list page it goes back to has even been created. */
  private unseen: (SavedRecord & { at: number })[] = [];

  /** The saves of this kind no list has shown yet; each is handed out once. */
  takeUnseen(entity: EntityType): SavedRecord[] {
    const now = Date.now();
    this.unseen = this.unseen.filter((s) => now - s.at <= UNSEEN_FOR_MS);
    const mine = this.unseen.filter((s) => s.entity === entity);
    this.unseen = this.unseen.filter((s) => s.entity !== entity);
    return mine;
  }

  run<T>(save: BackgroundSave<T>): void {
    save.request.subscribe({
      next: (res) => {
        // Balances changed: refresh the account totals.
        this.accountService.findOne(this.accountService.getAccount()).subscribe();
        this.unseen.push({ entity: save.entity, record: save.toRow(res), created: save.created, at: Date.now() });
        this.saved.next(save.entity);
        this.toaster.success(save.success, 'Success', TOASTER_CONFIGURATION);
      },
      error: () => this.toaster.error(save.failure, 'Error', TOASTER_CONFIGURATION),
    });
  }
}
