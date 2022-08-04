import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapsLockDirective } from './caps-lock.directive';



@NgModule({
  declarations: [CapsLockDirective],
  imports: [
    CommonModule
  ],
  exports: [CapsLockDirective]
})
export class CapsLockModule { }
