import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApitestingPageRoutingModule } from './apitesting-routing.module';

import { ApitestingPage } from './apitesting.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApitestingPageRoutingModule
  ],
  declarations: [ApitestingPage]
})
export class ApitestingPageModule {}
