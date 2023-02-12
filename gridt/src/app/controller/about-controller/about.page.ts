import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PrivacyPage } from 'src/app/controller/privacy-controller/privacy.page';
import {CreditsPage} from "../credits-controller/credits.page";
import {TutorialPage} from "../tutorial-controller/tutorial.page";

@Component({
  selector: 'about-controller',
  templateUrl: '../../view/about-view/about.page.html',
  styleUrls: ['../../view/about-view/about.page.scss'],
})
export class AboutPage {

  constructor(public modalController: ModalController) { 

  }

  async presentCredits() {
    const modal = await this.modalController.create({
      component: CreditsPage
    });
    console.debug("present credits-controller");
    return await modal.present();
  }

  async presentTutorial() {
    const modal = await this.modalController.create({
      component: TutorialPage
    });
    console.debug("present tutorial-controller");
    return await modal.present();
  }

  async presentPrivacy() {
    const modal = await this.modalController.create({
      component: PrivacyPage
    });
    console.log("present privacy-controller policy");
    return await modal.present();
  }

  ngOnDestroy() {
    this.modalController.dismiss();
  }
}
