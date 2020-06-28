import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { SettingsService} from '../core/identity.service'
import { Identity } from '../core/identity.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  identity$: Observable<Identity>;

  constructor(
    private idService: IdentityService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.identity$ = this.idService.theID$;
    this.idService.getSettings();
  }

  async showError(error:string) {
    const el = await this.alertCtrl.create({
      header: "Something went wrong while obtaining your profile from the server.",
      message: error,
      buttons: ["Okay"]
    });

    el.present();
  }
}
