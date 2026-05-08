import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SimplifiedAccount } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({ standalone: false,
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0 }),
            animate('400ms ease-out',
              style({ opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 1 }),
            animate('400ms ease-in',
              style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class AccountComponent extends Unsubscribe implements OnInit {
  readonly accountService = inject(AccountService);
  readonly sideBarService = inject(SideBarService);
  readonly navBarService = inject(NavBarService);
  readonly sharedService = inject(SharedService);
  readonly router = inject(Router);

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
          takeUntil(this.unsubscribe$)
        )
        .subscribe((simplifiedAccounts: SimplifiedAccount[]) => {
          this.accounts.set(simplifiedAccounts);
        }, () => {
          this.accounts.set([]);
        });
    } else {
      this.accounts.set(accounts);
      this.stopSpinner();
    }
  }

  selectAccount(account: SimplifiedAccount): void {
    this.startSpinner();
    this.accountService.findOne(account.id)
      .pipe(finalize(() => this.stopSpinner()))
      .subscribe(() => {
        localStorage.setItem("account", account.id);
        this.router.navigate(["/dashboard"]);
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
