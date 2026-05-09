import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SimplifiedAccount } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('400ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('400ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
  imports: [CommonModule, MatButtonModule, MatCardModule, MatRippleModule],
})
export class AccountComponent implements OnInit {
  readonly accountService = inject(AccountService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  readonly sharedService = inject(SharedService);
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly minSpinnerMs = 500;
  private spinnerStartedAt = Date.now();
  private spinnerTimeout: ReturnType<typeof setTimeout> | null = null;

  accounts = signal<SimplifiedAccount[]>([]);
  showSpinner = signal(true);

  ngOnInit(): void {
    this.navBarService.displayNavBar = false;
    this.sideBarService.displaySidebar = false;
    const accounts = history?.state?.accounts as SimplifiedAccount[] | undefined;
    if (!accounts) {
      this.accountService
        .findAllAccountsSimplified()
        .pipe(
          finalize(() => this.stopSpinner()),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(
          (simplifiedAccounts: SimplifiedAccount[]) => {
            if (this.tryAutoSelect(simplifiedAccounts)) return;
            this.accounts.set(simplifiedAccounts);
          },
          () => {
            this.accounts.set([]);
          },
        );
    } else {
      if (this.tryAutoSelect(accounts)) return;
      this.accounts.set(accounts);
      this.stopSpinner();
    }
  }

  /** Single profile: skip the picker entirely and load it. Returns true when the redirect fires. */
  private tryAutoSelect(accounts: SimplifiedAccount[] | null | undefined): boolean {
    if (accounts?.length !== 1) return false;
    this.selectAccount(accounts[0]);
    return true;
  }

  selectAccount(account: SimplifiedAccount): void {
    this.startSpinner();
    this.accountService
      .findOne(account.id)
      .pipe(finalize(() => this.stopSpinner()))
      .subscribe(() => {
        localStorage.setItem('account', account.id);
        this.router.navigate(['/dashboard']);
      });
  }

  getAccountLabel(account: SimplifiedAccount): string {
    const value = account?.title?.trim();
    if (!value || value.toLowerCase() === 'titl') {
      return 'My Profile';
    }
    return value;
  }

  getAccountInitials(account: SimplifiedAccount): string {
    const label = this.getAccountLabel(account);
    const tokens = label.split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      return 'MP';
    }
    if (tokens.length === 1) {
      return tokens[0].slice(0, 2).toUpperCase();
    }
    return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
  }

  profileCountLabel(): string {
    const count = this.accounts().length;
    if (count === 1) {
      return '1 profile';
    }
    return `${count} profiles`;
  }

  private startSpinner(): void {
    if (this.spinnerTimeout) {
      clearTimeout(this.spinnerTimeout);
      this.spinnerTimeout = null;
    }
    this.spinnerStartedAt = Date.now();
    this.showSpinner.set(true);
  }

  private stopSpinner(): void {
    const elapsed = Date.now() - this.spinnerStartedAt;
    const remaining = Math.max(0, this.minSpinnerMs - elapsed);
    this.spinnerTimeout = setTimeout(() => {
      this.showSpinner.set(false);
      this.spinnerTimeout = null;
    }, remaining);
  }
}
