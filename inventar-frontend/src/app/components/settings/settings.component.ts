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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { CURRENCIES, TOASTER_CONFIGURATION } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

const BASE_CURRENCY_KEY = 'baseCurrency';
const LANDING_PAGE_KEY = 'defaultLandingPage';
const DEFAULT_LANDING_PAGE = '/welcome';

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
    MatSlideToggleModule,
    PillButtonComponent,
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
  private readonly router = inject(Router);
  private readonly flagPipe = inject(FlagPipe);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly toaster = inject(ToastrService);

  /** Disables the test button while a notification is pending. */
  readonly notificationTestPending = signal(false);
  readonly notificationsSupported = this.notificationService.isSupported();

  readonly currencies = CURRENCIES;

  /** Routes the user can be dropped onto right after sign-in. */
  readonly landingPages: readonly string[] = ['/welcome', '/dashboard'];

  /** Live signal so the toggle reflects external theme changes (nav-bar). */
  readonly darkMode = signal(this.themeService.themeValue === 'dark-theme');

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
  }

  toggleDarkMode(checked: boolean): void {
    const isDark = this.themeService.themeValue === 'dark-theme';
    if (isDark === checked) return;

    this.themeService.changeTheme();
    this.sharedService.applyBodyTheme(this.themeService.themeValue);
    this.darkMode.set(this.themeService.themeValue === 'dark-theme');

    if (this.configurationService.configuration) {
      this.configurationService.configuration.darkMode = checked;
      this.configurationService
        .updateConfiguration()
        .pipe(takeUntilDestroyed(this.destroyRef))
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

  /** Schedules a notification 10s out so we can verify the device's
   *  rendering. Must be invoked from a user gesture (button click) so
   *  iOS Safari accepts the permission prompt. */
  async sendTestNotification(): Promise<void> {
    if (this.notificationTestPending()) return;
    this.notificationTestPending.set(true);
    try {
      await this.notificationService.scheduleTestNotification(10_000);
      this.toaster.info(
        'A test notification will appear in 10 seconds.',
        'Scheduled',
        TOASTER_CONFIGURATION,
      );
      setTimeout(() => this.notificationTestPending.set(false), 10_000);
    } catch (err) {
      this.notificationTestPending.set(false);
      const code = (err as Error)?.message;
      if (code === 'UNSUPPORTED') {
        this.toaster.error(
          'Add Financa to your Home Screen and open it as an app to test notifications on iOS.',
          'Not supported here',
          TOASTER_CONFIGURATION,
        );
      } else if (code === 'NOT_GRANTED') {
        this.toaster.error(
          'Notifications are blocked. Enable them from your device settings.',
          'Permission denied',
          TOASTER_CONFIGURATION,
        );
      } else {
        this.toaster.error(
          'Could not schedule the notification — check the console for details.',
          'Something went wrong',
          TOASTER_CONFIGURATION,
        );
      }
    }
  }
}
