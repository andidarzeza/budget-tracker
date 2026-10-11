import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  Input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TOOLTIP_IMPORTS } from '../tooltip-mobile-guard/tooltip-imports';

/**
 * Icon field in the iOS style. In a grouped form it is a row ("Icon" · the
 * chosen glyph on a tinted tile · ›); tapping it opens a sheet like the
 * Reminders / Shortcuts glyph picker: Cancel + title, a large preview, a
 * search field and round glyph buttons in sections.
 *
 * Implements `ControlValueAccessor` so parents can keep using
 * `formControlName="icon"` like with any native input.
 */
@Component({
  selector: 'select-icon',
  templateUrl: './select-icon.component.html',
  styleUrls: ['./select-icon.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    ...TOOLTIP_IMPORTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('panelAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('320ms cubic-bezier(0.32, 0.72, 0, 1)', style({ opacity: 1, transform: 'none' })),
      ]),
      transition(':leave', [
        animate('220ms cubic-bezier(0.32, 0.72, 0, 1)', style({ opacity: 0, transform: 'translateY(40px)' })),
      ]),
    ]),
    trigger('fadeAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('160ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SelectIconComponent,
    },
  ],
})
export class SelectIconComponent implements ControlValueAccessor {
  /** Field label rendered above the trigger; matches the other labeled inputs. */
  @Input() label = 'Icon';
  /** Placeholder shown inside the trigger when no icon is selected. */
  @Input() placeholder = 'None';

  /** Whether the fullscreen icon picker is open. */
  readonly showIconSelect = signal(false);

  /** Search query, mirrored into a signal so the sections stay reactive. */
  readonly searchControl = new FormControl<string | null>('');
  readonly query = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  /**
   * Curated list of Material icons appropriate for budget categories.
   * Grouped in source by domain (food, transport, finance, etc.) so it's
   * easy to add/remove without re-sorting; rendered alphabetically isn't
   * needed since users will rely on the search.
   */
  /** Curated Material icons for budget categories, in picker sections. */
  readonly iconGroups: readonly { label: string; icons: readonly string[] }[] = [
    { label: 'Food & Drink', icons: [
      'fastfood', 'restaurant', 'restaurant_menu', 'local_cafe', 'coffee', 'local_pizza',
      'local_bar', 'wine_bar', 'liquor', 'lunch_dining', 'dinner_dining', 'ramen_dining',
      'bakery_dining', 'icecream', 'cake', 'set_meal', 'kitchen', 'soup_kitchen', 'egg',
      'breakfast_dining',
    ] },
    { label: 'Shopping', icons: [
      'shopping_cart', 'shopping_bag', 'shopping_basket', 'storefront', 'store',
      'local_grocery_store', 'local_mall', 'local_florist', 'redeem', 'card_giftcard', 'sell',
      'price_change', 'discount', 'inventory_2',
    ] },
    { label: 'Transport', icons: [
      'directions_car', 'directions_bus', 'directions_bike', 'directions_walk', 'directions_run',
      'directions_transit', 'directions_boat', 'commute', 'train', 'tram', 'subway', 'flight',
      'flight_takeoff', 'flight_land', 'local_airport', 'local_taxi', 'local_shipping',
      'two_wheeler', 'motorcycle', 'electric_bike', 'electric_scooter', 'electric_car',
      'local_gas_station', 'ev_station', 'local_parking',
    ] },
    { label: 'Home & Utilities', icons: [
      'home', 'house', 'apartment', 'cottage', 'villa', 'cabin', 'meeting_room', 'bed', 'bathtub',
      'shower', 'weekend', 'chair', 'table_restaurant', 'lightbulb', 'electrical_services',
      'water_drop', 'waves', 'thermostat', 'ac_unit', 'fireplace', 'local_laundry_service',
      'cleaning_services', 'plumbing', 'handyman', 'yard', 'grass',
    ] },
    { label: 'Money', icons: [
      'payment', 'payments', 'paid', 'attach_money', 'currency_exchange', 'monetization_on',
      'request_quote', 'receipt', 'receipt_long', 'price_check', 'account_balance',
      'account_balance_wallet', 'savings', 'credit_card', 'credit_score', 'wallet', 'percent',
      'trending_up', 'trending_down',
    ] },
    { label: 'Health', icons: [
      'local_hospital', 'medical_services', 'medication', 'medication_liquid', 'vaccines',
      'health_and_safety', 'healing', 'monitor_heart', 'masks', 'sick', 'bloodtype',
    ] },
    { label: 'Fitness & Sports', icons: [
      'fitness_center', 'sports_basketball', 'sports_soccer', 'sports_tennis', 'sports_football',
      'sports_volleyball', 'sports_baseball', 'sports_golf', 'sports_handball',
      'sports_martial_arts', 'sports_kabaddi', 'sports_esports', 'pool', 'hiking',
      'self_improvement', 'snowboarding', 'surfing', 'kayaking',
    ] },
    { label: 'Entertainment', icons: [
      'movie', 'theaters', 'tv', 'live_tv', 'music_note', 'library_music', 'queue_music', 'piano',
      'theater_comedy', 'casino', 'celebration', 'festival', 'attractions', 'palette', 'brush',
      'draw', 'photo_camera', 'photo_library', 'image', 'movie_creation',
    ] },
    { label: 'Travel & Places', icons: [
      'hotel', 'luggage', 'travel_explore', 'beach_access', 'terrain', 'map', 'location_city',
      'public', 'explore', 'park', 'forest', 'tour',
    ] },
    { label: 'Pets', icons: [
      'pets', 'cruelty_free',
    ] },
    { label: 'People', icons: [
      'person', 'people', 'group', 'family_restroom', 'child_care', 'face', 'face_2', 'face_3',
      'content_cut', 'checkroom', 'iron', 'dry_cleaning', 'spa',
    ] },
    { label: 'Tech', icons: [
      'phone', 'smartphone', 'sim_card', 'wifi', 'router', 'devices', 'computer', 'laptop_mac',
      'tablet', 'headphones', 'headset_mic', 'watch', 'gamepad', 'mouse', 'keyboard', 'memory',
      'usb', 'cable',
    ] },
    { label: 'Work & Education', icons: [
      'work', 'business', 'business_center', 'badge', 'school', 'menu_book', 'library_books',
      'edit_document', 'science', 'calculate', 'history_edu', 'auto_stories',
    ] },
    { label: 'Nature', icons: [
      'eco', 'energy_savings_leaf', 'recycling', 'compost', 'solar_power', 'wind_power',
    ] },
    { label: 'Other', icons: [
      'build', 'settings', 'star', 'favorite', 'bookmark', 'flag', 'verified', 'tag', 'category',
      'label', 'extension', 'auto_awesome', 'lightbulb_outline', 'sentiment_satisfied',
      'emoji_events', 'volunteer_activism', 'church', 'mosque', 'temple_buddhist', 'temple_hindu',
      'synagogue',
    ] },
  ];

  /** Every icon, once (search runs over this). */
  readonly icons: readonly string[] = this.iconGroups.flatMap((g) => g.icons);


  /** Sections to show: all groups, or one "Results" section while searching. */
  readonly visibleGroups = computed(() => {
    const q = (this.query() ?? '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!q) return this.iconGroups;
    const hits = this.icons.filter((name) => name.includes(q));
    return hits.length ? [{ label: 'Results', icons: hits }] : [];
  });

  /** Readable name for an icon ("local_cafe" → "Local cafe"), for screen readers. */
  iconLabel(icon: string): string {
    const words = icon.replace(/_/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  value: string;
  disabled = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Clicking the label or row padding opens the picker (the button itself already does). */
  openFromRow(event: MouseEvent): void {
    if (!(event.target as Element).closest('.input-wrapper')) this.open();
  }

  open(): void {
    if (this.disabled) return;
    this.showIconSelect.set(true);
    this.searchControl.setValue('');
    this.onTouched();
  }

  close(): void {
    this.showIconSelect.set(false);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  select(icon: string): void {
    this.value = icon;
    this.onChange(icon);
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showIconSelect()) this.close();
  }
}
