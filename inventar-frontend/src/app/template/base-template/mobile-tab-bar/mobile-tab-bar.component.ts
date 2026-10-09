import { Component, HostListener, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SideBarService } from 'src/app/services/side-bar.service';
import { ThemeSwitchComponent } from 'src/app/shared/theme-switch/theme-switch.component';

interface MoreItem {
  label: string;
  icon: string;
  link: string;
  /** iOS system colour for the icon square, as in the menu drawer. */
  color: string;
}

/** Thumb-reach navigation pinned to the bottom of the screen on phones. */
@Component({
  selector: 'mobile-tab-bar',
  templateUrl: './mobile-tab-bar.component.html',
  styleUrls: ['./mobile-tab-bar.component.css'],
  imports: [MatIconModule, RouterLink, RouterLinkActive, ThemeSwitchComponent],
})
export class MobileTabBarComponent {
  private readonly sideBarService = inject(SideBarService);
  private readonly router = inject(Router);

  /** The "More" popup that floats above its tab. */
  readonly moreOpen = signal(false);

  /** Pages that don't have their own tab. */
  readonly moreItems: readonly MoreItem[] = [
    { label: 'Home', icon: 'home', link: '/welcome', color: '#8e8e93' },
    { label: 'Categories', icon: 'category', link: '/categories', color: '#ff9500' },
    { label: 'Projects', icon: 'savings', link: '/projects', color: '#af52de' },
    { label: 'Exchange', icon: 'currency_exchange', link: '/exchange', color: '#30b0c7' },
    { label: 'History', icon: 'history', link: '/history', color: '#5856d6' },
    { label: 'Settings', icon: 'settings', link: '/settings', color: '#8e8e93' },
  ];

  /** Highlights "More" while one of its pages is showing. */
  get onMorePage(): boolean {
    const path = this.router.url.split(/[?#]/)[0];
    return this.moreItems.some((i) => path === i.link || path.startsWith(i.link + '/'));
  }

  /** Opens the routed full-screen create form, same as "New" on the expenses page. */
  addExpense(): void {
    this.closeAll();
    this.router.navigate(['/expenses/add']);
  }

  toggleMore(): void {
    this.sideBarService.closeMobileMenu();
    this.moreOpen.update((open) => !open);
  }

  closeAll(): void {
    this.moreOpen.set(false);
    this.sideBarService.closeMobileMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.moreOpen.set(false);
  }
}
