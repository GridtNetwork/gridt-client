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
  isDisabled$: Observable<boolean>;
  gravatar: string;

  constructor(
    private SetService: SettingsService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.SetService.populateStorage();
    this.settings$ = this.SetService.the_user_settings$;
    this.SetService.getUserSettings();

    this.isDisabled$ = this.SetService.isDisabled$;
    this.settings$.subscribe(set => this.gravatar = "https://www.gravatar.com/avatar/" + set.identity.avatar);
    console.log(`gravatar is ${this.gravatar}`)
  }

  public refreshPage(event) {
    this.SetService.getUserSettings();
    event.target.complete();
  }

}
