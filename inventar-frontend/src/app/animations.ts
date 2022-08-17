import {
    trigger,
    transition,
    style,
    query,
    group,
    animate
  } from '@angular/animations';


// Positioned

export const slider =
  trigger('routeAnimations', [
    transition('loginPage => accountPage', slideTo('right') ),
    // transition('* => loginPage', slideTo('right') ),
    // transition('accountPage => *', slideTo('right') ),
    // transition('* => accountPage', slideTo('right') ),
  ]);


function slideTo(direction) {
  const optional = { optional: true };
  return [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        [direction]: 0,
        width: '100%'
      })
    ], optional),
    query(':enter', [
      style({ [direction]: '-100%'})
    ]),
    group([
      query(':leave', [
        animate('600ms ease-out', style({ [direction]: '100%'}))
      ], optional),
      query(':enter', [
        animate('600ms ease-out', style({ [direction]: '0%'}))
      ])
    ]),
    // Normalize the page style... Might not be necessary

    // Required only if you have child animations on the page
    // query(':leave', animateChild()),
    // query(':enter', animateChild()),
  ];
}