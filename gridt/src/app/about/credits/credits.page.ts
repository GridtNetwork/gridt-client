import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.page.html',
  styleUrls: ['./credits.page.scss'],
})
export class CreditsPage implements OnInit {

  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }
  
  dismiss() {
    this.modalController.dismiss()
  }

}
