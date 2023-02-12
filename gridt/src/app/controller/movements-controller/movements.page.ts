import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { ApiService } from '../../model/services/api.service';
import { Movement } from '../../model/interfaces/movement.model';

@Component({
  selector: 'app-movements',
  templateUrl: '../../view/movements-view/movements.page.html',
  styleUrls: ['../../view/movements-view/movements.page.scss'],
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

    await el.present();
  }
}
