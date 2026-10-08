import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ThemeSwitchComponent } from 'src/app/shared/theme-switch/theme-switch.component';
import { Router } from '@angular/router';
import { Wallet } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { WalletService } from 'src/app/services/pages/wallet.service';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { CURRENCIES } from 'src/environments/environment';

const BASE_CURRENCY_KEY = 'baseCurrency';
const LANDING_PAGE_KEY = 'defaultLandingPage';
const DEFAULT_LANDING_PAGE = '/welcome';
/** localStorage keys for the preferred source on new expenses / incomes. */
export const DEFAULT_EXPENSE_WALLET_KEY = 'defaultExpenseWalletId';
export const DEFAULT_INCOME_WALLET_KEY = 'defaultIncomeWalletId';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [FlagPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    ThemeSwitchComponent,
    SelectInputComponent,
  ],
})
export class SettingsComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly sharedService = inject(SharedService);
  private readonly sideBarService = inject(SideBarService);
  private readonly navBarService = inject(NavBarService);
  private readonly walletService = inject(WalletService);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private readonly flagPipe = inject(FlagPipe);
  private readonly destroyRef = inject(DestroyRef);

  readonly currencies = CURRENCIES;

  /** Active sources, used to pick the default expense / income wallet. */
  readonly sources = signal<Wallet[]>([]);

  /** Default source for new expenses — persisted to localStorage. */
  readonly defaultExpenseWalletControl = new FormControl<string | null>(
    localStorage.getItem(DEFAULT_EXPENSE_WALLET_KEY),
  );
  /** Default source for new incomes — persisted to localStorage. */
  readonly defaultIncomeWalletControl = new FormControl<string | null>(
    localStorage.getItem(DEFAULT_INCOME_WALLET_KEY),
  );

  /** Source option label: "🏦 BKT · 🇪🇺 EUR". */
  readonly displaySource = (w: Wallet) =>
    `${w?.type === 'BANK' ? '🏦' : '💵'} ${w?.name} · ${this.flagPipe.transform(w?.currency)} ${w?.currency}`;
  readonly sourceIdValue = (w: Wallet) => w?.id ?? null;

  /** Routes the user can be dropped onto right after sign-in. */
  readonly landingPages: readonly string[] = ['/welcome', '/dashboard'];

  /** Currency picker control — value persisted to localStorage on change. */
  readonly baseCurrencyControl = new FormControl<string | null>(
    localStorage.getItem(BASE_CURRENCY_KEY) || CURRENCIES[0],
  );

  /** Default landing page after login — persisted to localStorage. */
  readonly landingPageControl = new FormControl<string | null>(
    localStorage.getItem(LANDING_PAGE_KEY) || DEFAULT_LANDING_PAGE,
  );

  /** Currency option label: "🇺🇸 USD". */
  readonly displayCurrency = (c: string) => `${this.flagPipe.transform(c)} ${c}`;

  /** Route option label — `/welcome` → "Welcome page" etc. */
  readonly displayLandingPage = (p: string): string => {
    switch (p) {
      case '/welcome':
        return 'Welcome page';
      case '/dashboard':
        return 'Dashboard';
      default:
        return p;
    }
  };

  /** User initials for the avatar; falls back to "?" when no user. */
  readonly initials = computed(() => {
    const u = this.authenticationService.currentUserValue;
    if (!u) return '?';
    const first = (u.firstName || '').charAt(0).toUpperCase();
    const last = (u.lastName || '').charAt(0).toUpperCase();
    return first + last || '?';
  });

  /** "Andi Darzeza" — used as the display name in the profile card. */
  get fullName(): string {
    const u = this.authenticationService.currentUserValue;
    if (!u) return 'Guest';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || 'Guest';
  }

  get username(): string {
    return this.authenticationService.currentUserValue?.username ?? '';
  }

  get appVersion(): string {
    return '1.0.0';
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;

    // Persist base-currency changes immediately. No backend call needed —
    // it's a local default for new expenses / incomes / projects.
    this.baseCurrencyControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          localStorage.setItem(BASE_CURRENCY_KEY, value);
        } else {
          localStorage.removeItem(BASE_CURRENCY_KEY);
        }
      });

    this.landingPageControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          localStorage.setItem(LANDING_PAGE_KEY, value);
        } else {
          localStorage.removeItem(LANDING_PAGE_KEY);
        }
      });

    this.persistOnChange(this.defaultExpenseWalletControl, DEFAULT_EXPENSE_WALLET_KEY);
    this.persistOnChange(this.defaultIncomeWalletControl, DEFAULT_INCOME_WALLET_KEY);
    this.loadSources();
  }

  /** Persist a control's value to localStorage on every change (clearing when empty). */
  private persistOnChange(control: FormControl<string | null>, key: string): void {
    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    });
  }

  private loadSources(): void {
    const accountId = this.accountService.getAccount();
    if (!accountId) return;
    this.walletService
      .list(accountId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((wallets) => this.sources.set((wallets ?? []).filter((w) => !w.archived)));
  }

  switchAccount(): void {
    localStorage.removeItem('account');
    this.router.navigate(['/account']);
  }

  logout(): void {
    this.authenticationService.logout();
  }
}
