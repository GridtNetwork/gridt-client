import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnnouncementPageRoutingModule } from 'src/app/controller/announcement-controller/announcement-routing.module';

import { AnnouncementPage } from './announcement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnnouncementPageRoutingModule
  ],
  declarations: [AnnouncementPage]
})
export class AnnouncementPageModule {}
