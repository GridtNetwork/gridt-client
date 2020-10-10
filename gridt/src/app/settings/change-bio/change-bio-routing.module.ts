import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangeBioPage } from './change-bio.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeBioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeBioPageRoutingModule {}
