import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AboutPageRoutingModule } from './about-routing.module';
import { AboutPage } from './about.page';

import { CreditsPageModule } from './credits/credits.module';
import { TutorialPageModule } from './tutorial/tutorial.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AboutPageRoutingModule,
    CreditsPageModule,
    TutorialPageModule
  ],
  declarations: [AboutPage]
})
export class AboutPageModule {}
