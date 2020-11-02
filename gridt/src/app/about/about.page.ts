import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CreditsPage } from './credits/credits.page';
import { TutorialPage } from './tutorial/tutorial.page';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage {

  constructor(public modalController: ModalController) { }

  async presentCredits() {
    const modal = await this.modalController.create({
      component: CreditsPage
    });
    console.debug("present credits");
    return await modal.present();
  }

  async presentTutorial() {
    const modal = await this.modalController.create({
      component: TutorialPage
    });
    console.debug("present tutorial");
    return await modal.present();
  }

  ngOnDestroy() {
    this.modalController.dismiss();
  }

}