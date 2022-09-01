import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DarkModeComponent } from './dark-mode/dark-mode.component';
import { LanguageComponent } from './language/language.component';
import { SettingsComponent } from './settings.component';
import { ThemeComponent } from './theme/theme.component';


const routes: Routes = [{
  path: '', component: SettingsComponent,
  children: [
    {
      path: 'theme', component: ThemeComponent
    },
    {
      path: 'dark-mode', component: DarkModeComponent
    },
    {
      path: 'language', component: LanguageComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
