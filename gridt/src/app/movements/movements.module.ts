import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MovementsPage } from './movements.page';
import { MovementsFilterPipe } from './movement-filter.pipe';

const routes: Routes = [
  {
    path: '',
    component: MovementsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    MovementsPage,
    MovementsFilterPipe
  ]
})
export class MovementsPageModule {}
