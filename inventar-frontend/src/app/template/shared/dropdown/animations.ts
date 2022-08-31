import { animate, style, transition, trigger } from "@angular/animations";


export const slideDownUp = trigger(
    'slideDownUp', 
    [
      transition(
        ':enter', 
        [
          style({ opacity: 0, height: 0 }),
          animate('200ms ease-out', 
                  style({opacity: 1, height: 100 }))
        ]
      ),
      transition(
        ':leave', 
        [
          style({ opacity: 1, height: 100 }),
          animate('200ms ease-in', 
                  style({ opacity: 0, height: 0 }))
        ]
      )
    ]
  )