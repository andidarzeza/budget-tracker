import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';


// Settings is a single-page hub — no child routes. Sections render inline
// and persistence is local (theme, base currency) or backed by the
// existing services (configuration, account).
const routes: Routes = [
  { path: '', component: SettingsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
