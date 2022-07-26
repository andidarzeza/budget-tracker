import { animate, style, transition, trigger } from "@angular/animations";

export const inAnimation = trigger(
    'inAnimation', 
    [
      transition(
        ':enter', 
        [
          style({ opacity: 0 }),
          animate('400ms ease-out', 
                  style({opacity: 1 }))
        ]
      )
    ]
);

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

