import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { SettingsService} from '../core/settings.service'
import { Settings } from '../core/settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  settings$: Observable<Settings>;

  constructor(
    private SetService: SettingsService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.SetService.populateStorage();
    this.settings$ = this.SetService.the_user_settings$;
    this.SetService.getUserSettings();
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
