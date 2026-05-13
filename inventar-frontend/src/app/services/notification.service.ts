import { Injectable } from '@angular/core';

const SW_URL = '/notification-sw.js';

/** Random pool of harmless messages for the testing button — just so the
 *  notification body changes each tap and we can see how a few different
 *  lengths render on the lock screen / Notification Center. */
const TEST_MESSAGES: { title: string; body: string }[] = [
  { title: 'Hello from Financa', body: 'This is what a notification looks like.' },
  { title: 'Heads up', body: "You're doing great — keep tracking those expenses." },
  { title: 'Reminder', body: "Don't forget to log today's coffee run." },
  { title: 'Daily nudge', body: 'Small expenses add up. A 2-minute check pays off.' },
  { title: 'Tip', body: 'Add Financa to your Home Screen for the best PWA experience.' },
  { title: 'Test notification', body: 'If you can read this, push delivery is working.' },
];

/** Client-side notification helpers. Handles SW registration, permission
 *  prompts, and locally-scheduled (setTimeout) test notifications so we
 *  can verify how they render on the device before wiring real Web Push
 *  from a backend. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

  /** True if the platform exposes the APIs we need at all. iOS PWAs only
   *  expose these once the app is added to the Home Screen and opened
   *  standalone. */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window;
  }

  permissionState(): NotificationPermission {
    return this.isSupported() ? Notification.permission : 'denied';
  }

  /** Registers the SW once; subsequent calls return the cached promise. */
  async ensureRegistered(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('UNSUPPORTED');
    }
    if (!this.registrationPromise) {
      this.registrationPromise = navigator.serviceWorker.register(SW_URL);
    }
    try {
      return await this.registrationPromise;
    } catch (err) {
      this.registrationPromise = null;
      throw err;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    // Must be invoked synchronously from a user gesture on iOS — callers
    // should pass through directly from a click handler.
    return Notification.requestPermission();
  }

  /** Pops a notification after `delayMs`. Resolves immediately after
   *  scheduling so the UI can show feedback ("Sending in 10s…"). */
  async scheduleTestNotification(delayMs = 10_000): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('UNSUPPORTED');
    }
    const reg = await this.ensureRegistered();
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('NOT_GRANTED');
    }
    setTimeout(() => {
      const msg = TEST_MESSAGES[Math.floor(Math.random() * TEST_MESSAGES.length)];
      reg.showNotification(msg.title, {
        body: msg.body,
        icon: 'assets/icons/icon-192.png',
        badge: 'assets/icons/icon-192.png',
        tag: 'financa-test',
      });
    }, delayMs);
  }
}
