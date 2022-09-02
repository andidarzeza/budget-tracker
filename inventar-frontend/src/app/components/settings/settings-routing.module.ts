import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AppearanceComponent } from './appearance/appearance.component';
import { SettingsComponent } from './settings.component';


const routes: Routes = [{
  path: '', component: SettingsComponent,
  children: [
    {
      path: 'appearance', component: AppearanceComponent
    },
    {
      path: 'account', component: AccountComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
