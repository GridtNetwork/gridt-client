import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignalPageRoutingModule } from './signal-routing.module';

import { SignalPage } from './signal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignalPageRoutingModule
  ],
  declarations: [SignalPage]
})
export class SignalPageModule {}
