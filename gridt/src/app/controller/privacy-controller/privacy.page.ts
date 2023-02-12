import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'privacy-controller',
  templateUrl: '../../view/privacy-view/privacy.page.html',
  styleUrls: ['src/app/view/privacy-view/privacy.page.scss'],
})
export class PrivacyPage implements OnInit {

  constructor(public modalController: ModalController) { }

  ngOnInit() { }

  dismiss() {
    this.modalController.dismiss()
  }

}
