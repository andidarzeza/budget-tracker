import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { serverAPIURL } from 'src/environments/environment';
import { IConfiguration } from '../models/models';

/**
 * Settings kept on the server so they survive logout (which clears them from
 * localStorage). They're mirrored into localStorage, where the app reads them.
 */
export const BASE_CURRENCY_KEY = 'baseCurrency';
export const DEFAULT_EXPENSE_WALLET_KEY = 'defaultExpenseWalletId';
export const DEFAULT_INCOME_WALLET_KEY = 'defaultIncomeWalletId';
export type SyncedSetting = typeof BASE_CURRENCY_KEY | typeof DEFAULT_EXPENSE_WALLET_KEY | typeof DEFAULT_INCOME_WALLET_KEY;
export const SYNCED_SETTINGS: readonly SyncedSetting[] = [BASE_CURRENCY_KEY, DEFAULT_EXPENSE_WALLET_KEY, DEFAULT_INCOME_WALLET_KEY];

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private readonly http = inject(HttpClient);

  readonly API_URl: string = `${serverAPIURL}/api/configuration`;
  configuration: IConfiguration;

  updateConfiguration(): Observable<any> {
    delete this.configuration['user'];
    return this.http.put(this.API_URl, this.configuration);
  }

  getConfiguration(): Observable<any> {
    return this.http
      .get(this.API_URl)
      .pipe(
        map((configuration: any) => {
          this.configuration = configuration;
          this.restoreSyncedSettings(configuration);
          return configuration;
        })
      );
  }

  /** Save one synced setting locally and on the server. */
  saveSetting(key: SyncedSetting, value: string | null): void {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
    (this.configuration ? of(this.configuration) : this.getConfiguration())
      .pipe(
        mergeMap((configuration: IConfiguration) => {
          configuration[key] = value;
          return this.updateConfiguration();
        }),
      )
      .subscribe({ error: () => {} });
  }

  private restoreSyncedSettings(configuration: IConfiguration): void {
    for (const key of SYNCED_SETTINGS) {
      const saved = configuration?.[key];
      if (saved) {
        localStorage.setItem(key, saved);
      } else if (localStorage.getItem(key)) {
        // Chosen before settings were kept on the server: upload it once.
        this.saveSetting(key, localStorage.getItem(key));
      }
    }
  }
}
