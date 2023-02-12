import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tutorial',
  templateUrl: '../../view/tutorial-view/tutorial.page.html',
  styleUrls: ['../../view/tutorial-view/tutorial.page.scss'],
})
export class TutorialPage implements OnInit {
  url = "";
  constructor(public router: Router,
              public modalController: ModalController) {
                this.url = this.router.url;
              }
  finishTutorial() {
    console.log(this.url);
    if ( this.url === "/home" ) {
      this.router.navigateByUrl('/movements');
    } else {
      this.modalController.dismiss();
    }
  }

  ngOnInit() {
  }

}
