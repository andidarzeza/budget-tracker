import { animate, style, transition, trigger } from '@angular/animations';

export const inOutAnimation = trigger('inOutAnimation', [
  transition(':enter', [style({ opacity: 0 }), animate('400ms ease-out', style({ opacity: 1 }))]),
  transition(':leave', [style({ opacity: 1 }), animate('400ms ease-in', style({ opacity: 0 }))]),
]);

export const inOutSlide = trigger('inOutSlide', [
  transition(':enter', [
    style({ width: '0px' }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ width: '40%' })),
  ]),
  transition(':leave', [
    style({ width: '40%' }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ width: '0px' })),
  ]),
]);

/** Empty trigger — kept so `<base-template [@routeAnimations]>` resolves; no transitions. */
export const slider = trigger('routeAnimations', []);
