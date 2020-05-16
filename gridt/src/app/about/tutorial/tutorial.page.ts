import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {

  constructor(private router: Router,
              public modalController: ModalController) { }

  finish() {
    if(this.router.url === "/about") this.modalController.dismiss();
    this.router.navigateByUrl('/movements');
  }

  ngOnInit() {
  }

}
