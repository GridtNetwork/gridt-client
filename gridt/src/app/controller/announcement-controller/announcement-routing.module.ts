import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnnouncementPage } from './announcement.page';

const routes: Routes = [
  {
    path: '',
    component: AnnouncementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnnouncementPageRoutingModule {}
