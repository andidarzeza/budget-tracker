import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FeedbackService, Haptic, Sound } from '../services/feedback.service';

/**
 * Give every toast the matching iOS feedback: success / warning / error
 * haptics, and the success / error sound (if sounds are on). Toasts already
 * mark each save, delete and failure across the app, so hooking them here
 * covers all of those without touching each form. Run at start-up.
 */
export function hookToastFeedback(): void {
  const toastr = inject(ToastrService) as unknown as Record<string, (...args: unknown[]) => unknown>;
  const feedback = inject(FeedbackService);
  const wrap = (method: 'success' | 'warning' | 'error', haptic: Haptic, sound?: Sound) => {
    const original = toastr[method].bind(toastr);
    toastr[method] = (...args: unknown[]) => {
      feedback.haptic(haptic);
      if (sound) feedback.sound(sound);
      return original(...args);
    };
  };
  wrap('success', 'success', 'success');
  wrap('warning', 'warning');
  wrap('error', 'error', 'error');
}
