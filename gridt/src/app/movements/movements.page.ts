import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { ApiService } from '../core/api.service';
import { Movement } from '../core/movement.model';

@Component({
  selector: 'app-movements',
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
})
export class MovementsPage implements OnInit, OnDestroy {
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

  ngOnDestroy() {
    this.alertCtrl.dismiss();
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
