import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SortingPageRoutingModule } from './sorting-routing.module';

import { SortingPage } from './sorting.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SortingPageRoutingModule
  ],
  declarations: [SortingPage]
})
export class SortingPageModule {}
