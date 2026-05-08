import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { CURRENCIES } from 'src/environments/environment';

const BASE_CURRENCY_KEY = 'baseCurrency';

@Component({
  standalone: false,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [FlagPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent extends Unsubscribe implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly sharedService = inject(SharedService);
  private readonly sideBarService = inject(SideBarService);
  private readonly navBarService = inject(NavBarService);
  private readonly router = inject(Router);
  private readonly flagPipe = inject(FlagPipe);

  readonly currencies = CURRENCIES;

  /** Live signal so the toggle reflects external theme changes (nav-bar). */
  readonly darkMode = signal(this.themeService.themeValue === 'dark-theme');

  /** Currency picker control — value persisted to localStorage on change. */
  readonly baseCurrencyControl = new FormControl<string | null>(
    localStorage.getItem(BASE_CURRENCY_KEY) || CURRENCIES[0]
  );

  /** Currency option label: "🇺🇸 USD". */
  readonly displayCurrency = (c: string) => `${this.flagPipe.transform(c)} ${c}`;

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
    // Static for now — pulled from package.json at build time would be cleaner
    // long-term, but Angular doesn't expose that without extra config.
    return '1.0.0';
  }

  ngOnInit(): void {
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;

    // Persist base-currency changes immediately. No backend call needed —
    // it's a local default for new expenses / incomes / projects.
    this.baseCurrencyControl.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          localStorage.setItem(BASE_CURRENCY_KEY, value);
        } else {
          localStorage.removeItem(BASE_CURRENCY_KEY);
        }
      });
  }

  toggleDarkMode(checked: boolean): void {
    // Only toggle if the new state differs (slide-toggle change can fire on init).
    const isDark = this.themeService.themeValue === 'dark-theme';
    if (isDark === checked) return;

    this.themeService.changeTheme();
    this.sharedService.applyBodyTheme(this.themeService.themeValue);
    this.darkMode.set(this.themeService.themeValue === 'dark-theme');

    // Best-effort backend persistence — fire and forget; UI is already updated.
    if (this.configurationService.configuration) {
      this.configurationService.configuration.darkMode = checked;
      this.configurationService
        .updateConfiguration()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({ error: () => {} });
    }
  }

  switchAccount(): void {
    localStorage.removeItem('account');
    this.router.navigate(['/account']);
  }

  logout(): void {
    this.authenticationService.logout();
  }
}
