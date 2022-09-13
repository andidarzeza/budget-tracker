import {
  trigger,
  transition,
  style,
  query,
  group,
  animate
} from '@angular/animations';

export const inOutAnimation = trigger(
  'inOutAnimation', 
  [
    transition(
      ':enter', 
      [
        style({ opacity: 0 }),
        animate('400ms ease-out', 
                style({opacity: 1 }))
      ]
    ),
    transition(
      ':leave', 
      [
        style({ opacity: 1 }),
        animate('400ms ease-in', 
                style({ opacity: 0 }))
      ]
    )
  ]
)

export const inOutSlide = trigger(
  'inOutSlide', 
  [
    transition(
      ':enter', 
      [
        style({ width: '0px' }),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
                style({width: '40%' }))
      ]
    ),
    transition(
      ':leave', 
      [
        style({ width: '40%' }),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
                style({ width: '0px' }))
      ]
    )
  ]
)

// Positioned

export const slider =
  trigger('routeAnimations', [
    transition('loginPage => accountPage', slideTo('right')),
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
      style({ [direction]: '-100%' })
    ]),
    group([
      query(':leave', [
        animate('600ms ease-out', style({ [direction]: '100%' }))
      ], optional),
      query(':enter', [
        animate('600ms ease-out', style({ [direction]: '0%' }))
      ])
    ]),
    // Normalize the page style... Might not be necessary

    // Required only if you have child animations on the page
    // query(':leave', animateChild()),
    // query(':enter', animateChild()),
  ];
}