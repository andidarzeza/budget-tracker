import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlagPipe } from './flag.pipe';



@NgModule({
  declarations: [FlagPipe],
  imports: [
    CommonModule
  ],
  exports: [FlagPipe]
})
export class FlagPipeModule { }
