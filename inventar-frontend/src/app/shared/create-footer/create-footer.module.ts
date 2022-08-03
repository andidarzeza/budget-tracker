import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateFooterComponent } from './create-footer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [CreateFooterComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [CreateFooterComponent]
})
export class CreateFooterModule { }
