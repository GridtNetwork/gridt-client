import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignalPage } from './signal.page';

const routes: Routes = [
  {
    path: '',
    component: SignalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignalPageRoutingModule {}
