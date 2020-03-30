import { Component, OnInit } from '@angular/core';
import { MenuController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { Movement } from '../api/movement.model';

@Component({
  selector: 'app-movements',
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
})
export class MovementsPage implements OnInit {
  searchText: string = "";
  movements$: Observable<Movement[]>;

  constructor(
    private api: ApiService,
    private menuCtrl: MenuController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.movements$ = this.api.allMovements$;
    this.api.getAllMovements();
  }

  async showError(error:string) {
    const el = await this.alertCtrl.create({
      header: "Something went wrong while creating your movement.", 
      message: error,
      buttons: ["Okay"]
    });

    el.present();
  }
}
