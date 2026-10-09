import { PinkToggleComponent } from 'src/app/shared/pink-toggle/pink-toggle.component';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, DestroyRef, ElementRef, HostListener, inject, Input, OnChanges, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';
import { ThemeSwitchComponent } from 'src/app/shared/theme-switch/theme-switch.component';
import { MenuItem, SideBarMode } from '../base-template.models';

@Component({
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
  imports: [
    PinkToggleComponent,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
    IconButtonComponent,
    ThemeSwitchComponent,
    ...TOOLTIP_IMPORTS,
  ],
})
export class SideBarComponent implements OnChanges, AfterViewInit {
  readonly sharedService = inject(SharedService);
  readonly authenticationService = inject(AuthenticationService);
  readonly sideBarService = inject(SideBarService);
  readonly router = inject(Router);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly breakpoint = inject(BreakpointService);
  private readonly destroyRef = inject(DestroyRef);

  /** Mirrors the table-card mobile breakpoint (≤767px). */
  readonly isMobile = signal(false);

  private readonly _navigation = signal<MenuItem[]>([]);
  @Input() set navigation(items: MenuItem[]) { this._navigation.set(items ?? []); }
  get navigation(): MenuItem[] { return this._navigation(); }
  @Input() sideBarMode: SideBarMode;

  constructor() {
    this.breakpoint.useTableCardLayout$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mobile) => this.isMobile.set(mobile));
  }

  selIndex = 1;

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  readonly menuOpen = signal(false);
  readonly query = signal('');
  readonly filteredNavigation = computed(() => {
    const q = this.query().trim().toLowerCase();
    const items = this._navigation();
    return q ? items.filter((i) => {
      const hay = `${i.text} ${i.description ?? ''}`.toLowerCase();
      return q.split(/\s+/).every((part) => hay.includes(part));
    }) : items;
  });

  private static readonly HUES = [235, 262, 290, 330, 12, 30, 152, 175, 200];

  /** Stable tint per label, same hashing as Workspace Manual's avatars. */
  hueFor(name: string): number {
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    return SideBarComponent.HUES[Math.abs(hash) % SideBarComponent.HUES.length];
  }

  readonly fullName = computed(() => {
    const u = this.authenticationService.currentUserValue;
    return [u?.firstName, u?.lastName].filter(Boolean).map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ') || 'Account';
  });
  readonly initials = computed(() => this.fullName().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase());
  readonly userHue = computed(() => this.hueFor(this.fullName()));

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  }

  openFirstMatch(): void {
    const first = this.filteredNavigation()[0];
    if (!first) return;
    this.router.navigate([first.link]);
    this.onNavItemClick(this.navigation.indexOf(first));
    this.query.set('');
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
      this.searchInput.nativeElement.blur();
    }
  }

  go(link: string): void {
    this.menuOpen.set(false);
    this.router.navigate([link]);
  }

  switchAccount(): void {
    this.menuOpen.set(false);
    localStorage.removeItem('account');
    this.router.navigate(['/account']);
  }

  logout(): void {
    this.menuOpen.set(false);
    this.authenticationService.logout();
  }

  ngAfterViewInit(): void {
    this.applyStoredSidebarWidth();
  }

  ngOnChanges(): void {
    this.navigation?.forEach((item: MenuItem) => {
      if (item.link === window.location.pathname || window.location.pathname.includes(item.link)) {
        setTimeout(() => {
          this.animateSelectedOption(this.navigation.indexOf(item));
        }, 0);
      }
    });
  }

  private applyStoredSidebarWidth(): void {
    this.sideBarService.isOpened = true;
    this.sideBarService.openSideBar();
  }

  activateSpinner(): void {
    this.routeSpinnerService.startLoading();
  }

  onNavItemClick(index: number): void {
    this.activateSpinner();
    this.animateSelectedOption(index);
  }

  animateSelectedOption(index: number): void {
    const activeItem = document.getElementById('active-item') as HTMLElement;
    if (activeItem) {
      const margin = index + 1;
      activeItem.style.transform = `translate(0%, calc(${index * 100}% + ${index * 3 + margin * 3}px))`;
    }
  }
}

