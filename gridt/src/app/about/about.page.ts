import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PrivacyPage } from './privacy/privacy.page';
import { CreditsPage } from './credits/credits.page';
import { TutorialPage } from './tutorial/tutorial.page';

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

  async presentCredits() {
    const modal = await this.modalController.create({
      component: CreditsPage
    });
    console.log("present credits");
    return await modal.present();
  }

  async presentTutorial() {
    const modal = await this.modalController.create({
      component: TutorialPage
    });
    console.log("present tutorial");
    return await modal.present();
  }

}