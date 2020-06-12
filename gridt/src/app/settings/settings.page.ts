import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { IdentityService} from '../core/identity.service'
import { Identity } from '../core/identity.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  identity$: Observable<Identity>;

  // username = identity$.pipe(pluck('username'));
  gravatar: String = "https://www.gravatar.com/avatar/hash";
  username: String = "John Doe (sv)";
  email: String = "JohnDoe@gridt.org (sv)"
  bio: String = "A very short demo bio for John Doe. (sv)"

  constructor(
    private idService: IdentityService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.identity$ = this.idService.theID$;
    // this.username = this.identity$.pipe(pluck('username'))
    // this.email = this.identity$.pip(pluck('email'))
    this.idService.getIdentity();
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
