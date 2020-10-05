import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {

  constructor(public router: Router,
              public modalController: ModalController) { }

  finishTutorial() {
    if ( this.router.url === "/home" ) {
      this.router.navigateByUrl('/movements');
    }
    else {
      this.modalController.dismiss();
    }
  }

  ngOnInit() {
  }

}
