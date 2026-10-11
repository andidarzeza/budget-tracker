import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';

export type PushState = 'unsupported' | 'needs-install' | 'blocked' | 'off' | 'on';

/**
 * Phone / browser push notifications (Web Push). The service worker
 * (`/push-sw.js`) shows what the server sends; this service turns them on
 * and off for this device.
 *
 * On iPhone, web push only works for the app added to the Home Screen
 * (iOS 16.4+), and the permission prompt must come from a tap.
 */
@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly http = inject(HttpClient);
  private readonly api = `${serverAPIURL}/api/push`;

  readonly state = signal<PushState>('off');
  readonly busy = signal(false);

  /** Register the worker (once, at app start) so pushes are shown even when the app is closed. */
  register(): void {
    if (!this.supported()) return;
    navigator.serviceWorker.register('/push-sw.js').catch(() => {});
  }

  /** Work out the current state for the Settings switch. */
  async refresh(): Promise<void> {
    if (!this.supported()) {
      this.state.set(this.isIosBrowserTab() ? 'needs-install' : 'unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      this.state.set('blocked');
      return;
    }
    const subscription = await this.currentSubscription();
    if (!subscription) {
      this.state.set('off');
      return;
    }
    try {
      const res = await firstValueFrom(
        this.http.post<{ subscribed: boolean }>(`${this.api}/subscriptions/status`, { endpoint: subscription.endpoint }),
      );
      this.state.set(res.subscribed ? 'on' : 'off');
    } catch {
      this.state.set('off');
    }
  }

  /** Ask permission (call from a tap), subscribe this device and register it with the server. */
  async enable(): Promise<void> {
    if (!this.supported()) return;
    this.busy.set(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        this.state.set(permission === 'denied' ? 'blocked' : 'off');
        return;
      }
      const registration = await navigator.serviceWorker.register('/push-sw.js');
      await navigator.serviceWorker.ready;
      const { publicKey } = await firstValueFrom(this.http.get<{ publicKey: string }>(`${this.api}/public-key`));
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToBytes(publicKey),
        }));
      const json = subscription.toJSON();
      await firstValueFrom(
        this.http.post(`${this.api}/subscriptions`, {
          endpoint: json.endpoint,
          p256dh: json.keys?.['p256dh'],
          auth: json.keys?.['auth'],
          userAgent: navigator.userAgent,
        }),
      );
      this.state.set('on');
    } finally {
      this.busy.set(false);
    }
  }

  /** Stop notifications on this device. */
  async disable(): Promise<void> {
    this.busy.set(true);
    try {
      const subscription = await this.currentSubscription();
      if (subscription) {
        await firstValueFrom(this.http.post(`${this.api}/subscriptions/remove`, { endpoint: subscription.endpoint })).catch(() => {});
        await subscription.unsubscribe().catch(() => false);
      }
      this.state.set('off');
    } finally {
      this.busy.set(false);
    }
  }

  /** Ask the server to push a test notification to this user's devices. */
  async sendTest(): Promise<number> {
    const res = await firstValueFrom(this.http.post<{ delivered: number }>(`${this.api}/test`, {}));
    return res?.delivered ?? 0;
  }

  private supported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /** iPhone Safari tab (not the Home Screen app): push needs the installed app. */
  private isIosBrowserTab(): boolean {
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const standalone = (navigator as any).standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
    return ios && !standalone;
  }

  private async currentSubscription(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.getRegistration('/');
    return (await registration?.pushManager.getSubscription()) ?? null;
  }
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = (value + '='.repeat((4 - (value.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
