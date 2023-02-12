import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { SignalMessageComponent } from './signal-message-component/signal-message.component';
import { TutorialPageModule } from '../about/tutorial/tutorial.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    TutorialPageModule
  ],
  declarations: [HomePage, SignalMessageComponent]
})
export class HomePageModule {}
