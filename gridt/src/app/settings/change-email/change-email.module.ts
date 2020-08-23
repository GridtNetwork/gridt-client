import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangeEmailPageRoutingModule } from './change-email-routing.module';

import { ChangeEmailPage } from './change-email.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeEmailPageRoutingModule
  ],
  declarations: [ChangeEmailPage]
})
export class ChangeEmailPageModule {}
