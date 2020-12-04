import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SortingPage } from './sorting.page';

const routes: Routes = [
  {
    path: '',
    component: SortingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SortingPageRoutingModule {}
