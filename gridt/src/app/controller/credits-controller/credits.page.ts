import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-credits-controller',
  templateUrl: '../../view/credits-view/credits.page.html',
  styleUrls: ['../../view/credits-view/credits.page.scss'],
})
export class CreditsPage implements OnInit {

  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }
  
  dismiss() {
    this.modalController.dismiss()
  }

}
