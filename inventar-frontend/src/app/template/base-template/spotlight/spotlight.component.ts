import { DecimalPipe } from '@angular/common';
import {
  afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, Injector, signal, untracked, viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NavigationStart, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, filter, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { Category, CategoryType, ProjectView, Wallet } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { ProjectService } from 'src/app/services/pages/project.service';
import { WalletService } from 'src/app/services/pages/wallet.service';
import { SearchHit, SpotlightService } from 'src/app/services/spotlight.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ThemeService } from 'src/app/services/theme.service';
import { iosTileColorForName } from 'src/app/shared/ios/ios-colors';

interface SpotlightItem {
  key: string;
  title: string;
  subtitle?: string | null;
  /** Amount (with currency) shown on the right. */
  amount?: number | null;
  currency?: string | null;
  icon: string;
  color: string;
  run: () => void;
}

interface SpotlightSection {
  label: string;
  items: SpotlightItem[];
}

interface Action {
  title: string;
  keywords: string;
  icon: string;
  color: string;
  run: () => void;
}

const PAGES: ReadonlyArray<{ title: string; link: string; icon: string; color: string; keywords: string }> = [
  { title: 'Home', link: '/welcome', icon: 'home', color: '#8e8e93', keywords: 'today welcome start' },
  { title: 'Summary', link: '/dashboard', icon: 'space_dashboard', color: '#007aff', keywords: 'dashboard balance saved overview' },
  { title: 'Expenses', link: '/expenses', icon: 'trending_down', color: '#ff3b30', keywords: 'spending spent payments' },
  { title: 'Incomes', link: '/incomes', icon: 'trending_up', color: '#34c759', keywords: 'income salary earned' },
  { title: 'Categories', link: '/categories', icon: 'category', color: '#ff9500', keywords: 'category' },
  { title: 'Projects', link: '/projects', icon: 'savings', color: '#af52de', keywords: 'goals savings project' },
  { title: 'Exchange', link: '/exchange', icon: 'currency_exchange', color: '#30b0c7', keywords: 'euro lek rate converter currency' },
  { title: 'History', link: '/history', icon: 'history', color: '#5856d6', keywords: 'log activity changes' },
  { title: 'Settings', link: '/settings', icon: 'settings', color: '#8e8e93', keywords: 'preferences haptics notifications account log out' },
];

/** Debounce before asking the server for matching expenses / incomes. */
const RECORD_SEARCH_DELAY_MS = 180;

/**
 * App-wide search on desktop, like macOS Spotlight: one field that finds actions, pages,
 * categories, projects, sources (from data the app already holds) and
 * expenses / incomes (from `/api/search`). ↑ ↓ to move, ↩ to open, esc to close.
 */
@Component({
  selector: 'app-spotlight',
  templateUrl: './spotlight.component.html',
  styleUrls: ['./spotlight.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, DecimalPipe],
  host: { '(window:keydown)': 'onGlobalKeydown($event)' },
})
export class SpotlightComponent {
  readonly spotlight = inject(SpotlightService);
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly projectService = inject(ProjectService);
  private readonly walletService = inject(WalletService);
  private readonly themeService = inject(ThemeService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private readonly input = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  readonly query = signal('');
  readonly active = signal(0);

  private readonly categories = signal<Category[]>([]);
  private readonly projects = signal<ProjectView[]>([]);
  private readonly wallets = signal<Wallet[]>([]);

  /** Server matches for the current text (`q` says which text they belong to). */
  private readonly records = signal<{ q: string; expenses: SearchHit[]; incomes: SearchHit[] }>({ q: '', expenses: [], incomes: [] });
  readonly searching = signal(false);

  private readonly actions: Action[] = [
    { title: 'Add Expense', keywords: 'new expense spend pay add', icon: 'remove', color: '#ff3b30', run: () => this.openForm('expense') },
    { title: 'Add Income', keywords: 'new income salary earn add', icon: 'add', color: '#34c759', run: () => this.openForm('income') },
    { title: 'New Category', keywords: 'add category create', icon: 'category', color: '#ff9500', run: () => this.openForm('category') },
    { title: 'New Project', keywords: 'add project goal savings create', icon: 'savings', color: '#af52de', run: () => this.openForm('project') },
    {
      title: 'Switch to Dark Mode', keywords: 'dark theme night appearance', icon: 'dark_mode', color: '#5856d6',
      run: () => { this.themeService.setMode('dark'); this.close(); },
    },
    {
      title: 'Switch to Light Mode', keywords: 'light theme day appearance', icon: 'light_mode', color: '#ff9500',
      run: () => { this.themeService.setMode('light'); this.close(); },
    },
  ];

  readonly sections = computed<SpotlightSection[]>(() => {
    const q = this.query().trim().toLowerCase();
    const theme = this.themeService.theme();
    const actions = this.actions.filter((a) =>
      !(theme === 'dark-theme' && a.title === 'Switch to Dark Mode') && !(theme !== 'dark-theme' && a.title === 'Switch to Light Mode'));

    if (!q) {
      // Nothing typed yet: suggestions, like Spotlight's Siri Suggestions.
      return [
        { label: 'Quick Actions', items: actions.map((a) => this.actionItem(a)) },
        { label: 'Pages', items: PAGES.map((p) => this.pageItem(p)) },
      ];
    }

    const sections: SpotlightSection[] = [];
    const push = (label: string, items: SpotlightItem[]) => items.length && sections.push({ label, items });

    push('Actions', actions.filter((a) => matches(q, `${a.title} ${a.keywords}`)).map((a) => this.actionItem(a)));
    push('Pages', PAGES.filter((p) => matches(q, `${p.title} ${p.keywords}`)).map((p) => this.pageItem(p)));
    push('Categories', this.categories()
      .filter((c) => matches(q, `${c.category} ${c.description ?? ''}`))
      .slice(0, 5)
      .map((c) => ({
        key: `category:${c.id}`,
        title: c.category,
        subtitle: c.categoryType === CategoryType.INCOME ? 'Income category' : 'Expense category',
        icon: c.icon || 'category',
        color: iosTileColorForName(c.category),
        run: () => this.openForm('category', c.id),
      })));
    push('Projects', this.projects()
      .map((v) => v.project)
      .filter((p) => matches(q, `${p.name} ${p.description ?? ''}`))
      .slice(0, 4)
      .map((p) => ({
        key: `project:${p.id}`,
        title: p.name,
        subtitle: p.archived ? 'Archived project' : 'Project',
        amount: p.targetAmount,
        currency: p.targetCurrency,
        icon: p.icon || 'savings',
        color: '#af52de',
        run: () => this.go(`/projects/${p.id}`),
      })));
    push('Sources', this.wallets()
      .filter((w) => matches(q, `${w.name} ${w.currency} ${w.type === 'BANK' ? 'bank' : 'cash'}`))
      .slice(0, 4)
      .map((w) => ({
        key: `wallet:${w.id}`,
        title: w.name,
        subtitle: w.type === 'BANK' ? 'Bank account' : 'Cash',
        amount: w.balance,
        currency: w.currency,
        icon: w.type === 'BANK' ? 'account_balance' : 'payments',
        color: w.type === 'BANK' ? '#007aff' : '#34c759',
        run: () => this.go('/dashboard'),
      })));

    const records = this.records();
    if (records.q === q) {
      push('Expenses', records.expenses.map((h) => this.recordItem(h)));
      push('Incomes', records.incomes.map((h) => this.recordItem(h)));
    }
    return sections;
  });

  /** Everything in display order, for ↑ ↓ and ↩. */
  readonly flat = computed(() => this.sections().flatMap((s) => s.items));

  /** True when the search is done and nothing matched. */
  readonly empty = computed(() => !!this.query().trim() && !this.searching() && this.flat().length === 0);

  constructor() {
    // Opening: start fresh (or with the text handed over), focus the field,
    // and refresh the lists searched locally (served from the warm cache).
    effect(() => {
      if (!this.spotlight.isOpen()) return;
      untracked(() => {
        this.query.set(this.spotlight.initialQuery());
        this.active.set(0);
        this.loadLists();
        afterNextRender(() => {
          this.input()?.nativeElement.focus({ preventScroll: true });
        }, { injector: this.injector });
      });
    });

    // Server search for expenses / incomes as you type.
    toObservable(this.query)
      .pipe(
        map((q) => q.trim().toLowerCase()),
        distinctUntilChanged(),
        tap((q) => {
          this.active.set(0);
          this.searching.set(q.length > 0);
        }),
        debounceTime(RECORD_SEARCH_DELAY_MS),
        switchMap((q) => {
          const account = this.accountService.getAccount();
          if (!q || !account) return of({ q, expenses: [], incomes: [] });
          return this.spotlight.search(account, q).pipe(
            map((r) => ({ q, expenses: r.expenses ?? [], incomes: r.incomes ?? [] })),
            catchError(() => of({ q, expenses: [], incomes: [] })),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((r) => {
        this.records.set(r);
        this.searching.set(false);
      });

    // Any navigation closes it (back button, a link elsewhere).
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart), takeUntilDestroyed())
      .subscribe(() => this.spotlight.close());
  }

  close(): void {
    this.spotlight.close();
  }

  /** ⌘K / Ctrl+K toggles Spotlight from anywhere. */
  onGlobalKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (this.spotlight.isOpen()) this.close();
      else this.spotlight.open();
    }
  }

  onKeydown(e: KeyboardEvent): void {
    const count = this.flat().length;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    } else if (e.key === 'ArrowDown' && count) {
      e.preventDefault();
      this.active.set((this.active() + 1) % count);
      this.scrollActiveIntoView();
    } else if (e.key === 'ArrowUp' && count) {
      e.preventDefault();
      this.active.set((this.active() - 1 + count) % count);
      this.scrollActiveIntoView();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.flat()[this.active()]?.run();
    }
  }

  /** Index of an item in the flat list (for the highlighted row). */
  indexOf(item: SpotlightItem): number {
    return this.flat().indexOf(item);
  }

  clear(): void {
    this.query.set('');
    this.input()?.nativeElement.focus();
  }

  private go(link: string): void {
    this.close();
    this.router.navigateByUrl(link);
  }

  /**
   * Add / edit forms open as the same dialogs the desktop pages use (the
   * `/…/add` and `/…/:id/edit` routes are the phone versions). Each form is
   * loaded on demand. Open lists refresh themselves after a save (the save
   * invalidates the list cache, which tables watch).
   */
  private async openForm(kind: 'expense' | 'income' | 'category' | 'project', id?: string): Promise<void> {
    this.close();
    const component =
      kind === 'expense' ? (await import('src/app/components/expenses/add-expense/add-expense.component')).AddExpenseComponent
      : kind === 'income' ? (await import('src/app/components/incomes/add-income/add-income.component')).AddIncomeComponent
      : kind === 'category' ? (await import('src/app/components/categories/add-category/add-category.component')).AddCategoryComponent
      : (await import('src/app/components/projects/add-project/add-project.component')).AddProjectComponent;
    this.dialog.openDialog(component, id ? { id } : undefined).onSuccess(() => undefined);
  }

  private actionItem(a: Action): SpotlightItem {
    return { key: `action:${a.title}`, title: a.title, icon: a.icon, color: a.color, run: a.run };
  }

  private pageItem(p: (typeof PAGES)[number]): SpotlightItem {
    return { key: `page:${p.link}`, title: p.title, icon: p.icon, color: p.color, run: () => this.go(p.link) };
  }

  private recordItem(h: SearchHit): SpotlightItem {
    const income = h.type === 'INCOME';
    const date = h.date ? new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    return {
      key: `${h.type}:${h.id}`,
      title: h.description?.trim() || h.category || (income ? 'Income' : 'Expense'),
      subtitle: [h.description?.trim() ? h.category : null, date].filter(Boolean).join(' · '),
      amount: h.amount,
      currency: h.currency,
      icon: h.icon || (income ? 'trending_up' : 'trending_down'),
      color: iosTileColorForName(h.category),
      run: () => this.openForm(income ? 'income' : 'expense', h.id),
    };
  }

  private loadLists(): void {
    const account = this.accountService.getAccount();
    if (!account) return;
    forkJoin({
      expense: this.categoriesService.findByUsage(account, CategoryType.EXPENSE).pipe(catchError(() => of([] as Category[]))),
      income: this.categoriesService.findByUsage(account, CategoryType.INCOME).pipe(catchError(() => of([] as Category[]))),
      projects: this.projectService.list(account).pipe(catchError(() => of([] as ProjectView[]))),
      wallets: this.walletService.list(account).pipe(catchError(() => of([] as Wallet[]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ expense, income, projects, wallets }) => {
        this.categories.set([...(expense ?? []), ...(income ?? [])].filter((c) => !c.projectId));
        this.projects.set(projects ?? []);
        this.wallets.set((wallets ?? []).filter((w) => !w.archived));
      });
  }

  private scrollActiveIntoView(): void {
    setTimeout(() => this.list()?.nativeElement.querySelector('.sp-row--active')?.scrollIntoView({ block: 'nearest' }));
  }
}

/** Every word typed appears somewhere in `haystack`. */
function matches(q: string, haystack: string): boolean {
  const hay = haystack.toLowerCase();
  return q.split(/\s+/).every((part) => hay.includes(part));
}

