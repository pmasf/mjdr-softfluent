import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GlobalScreenComponent } from './global-screen/global-screen.component';
import { GmScreenComponent } from './gm-screen/gm-screen.component';


const routes: Routes = [
  { path: 'global-screen', component: GlobalScreenComponent },
  { path: 'gm-screen', component: GmScreenComponent },
  { path: '', redirectTo: '/global-screen', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
