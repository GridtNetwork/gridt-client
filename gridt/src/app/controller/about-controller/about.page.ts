import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PrivacyPage } from 'src/app/controller/privacy-controller/privacy.page';

@Component({
  selector: 'about-controller',
  templateUrl: '../../view/about-view/about.page.html',
  styleUrls: ['../../view/about-view//about.page.scss'],
})
export class AboutPage {

  constructor(public modalController: ModalController) { 

  }

  async presentPrivacy() {
    const modal = await this.modalController.create({
      component: PrivacyPage
    });
    console.log("present privacy-controller policy");
    return await modal.present();
  }
}
