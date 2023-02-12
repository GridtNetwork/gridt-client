import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PrivacyPage } from './privacy/privacy.page';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage {

  constructor(public modalController: ModalController) { 

  }

  async presentPrivacy() {
    const modal = await this.modalController.create({
      component: PrivacyPage
    });
    console.log("present privacy policy");
    return await modal.present();
  }
}