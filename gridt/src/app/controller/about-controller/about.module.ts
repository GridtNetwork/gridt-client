import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AboutPageRoutingModule } from './about-routing.module';
import { AboutPage } from './about.page';

import { PrivacyPageModule } from 'src/app/controller/privacy-controller/privacy.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AboutPageRoutingModule,
    PrivacyPageModule,
  ],
  declarations: [AboutPage]
})
export class AboutPageModule {}
