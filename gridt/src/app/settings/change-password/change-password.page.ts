import { Component, Input } from '@angular/core';
import { PopoverController, LoadingController, AlertController } from '@ionic/angular';

import { Observable, timer } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { NgForm } from '@angular/forms';

import { SettingsService} from '../../core/settings.service'
import { ApiService } from '../../core/api.service'
import { Settings } from '../../core/settings.model';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage {
  edit_password$: boolean = true;

  constructor(
    private SetService: SettingsService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public popoverCntrl: PopoverController,
    private api: ApiService
  ) { }

  ngOnInit() {
  }

  public closePopover() {
    this.popoverCntrl.dismiss({
      'dismissed': true
    });
  }

  /*
   * Change the password
   */
  async write_password(form: NgForm) {
    this.edit_password$ = true;

    const el = await this.loadingCtrl.create({
      message: 'Updating email address...'
    });

    el.present();

    this.api.changePassword$(form.value.old_password, form.value.new_password).pipe(timeout(2500)).subscribe(
      () => {
        el.dismiss();
        this.closePopover();
      },
      (error) => {
        el.dismiss();
        this.showError(error);
      }
    );

    timer(500).subscribe( () => this.SetService.updateUserSettings());
  }

  async showError(error:string) {
    const el = await this.alertCtrl.create({
      header: "Something went wrong while saving your settings.",
      message: error,
      buttons: ["Continue"]
    });

    el.present();
  }
}
