import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage implements OnInit {

  constructor(public modalController: ModalController) { 

  }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss()
  }

}
