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

// export const outAnimation = trigger(
//     'outAnimation', 
//     [
//       transition(
//         ':leave', 
//         [
//           style({ height: 100, opacity: 1 }),
//           animate('250ms ease-out', 
//                   style({height: 0, opacity: 0 }))
//         ]
//       )
//     ]
// );

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

