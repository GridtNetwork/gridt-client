import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApitestingPage } from './apitesting.page';

const routes: Routes = [
  {
    path: '',
    component: ApitestingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApitestingPageRoutingModule {}
