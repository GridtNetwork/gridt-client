import { Component, Input } from '@angular/core';
import { PopoverController, LoadingController, AlertController } from '@ionic/angular';

import { Observable, timer } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { NgForm } from '@angular/forms';

import { SettingsService} from '../../core/settings.service'
import { ApiService } from '../../core/api.service'

@Component({
  selector: 'app-change-bio',
  templateUrl: './change-bio.page.html',
  styleUrls: ['./change-bio.page.scss'],
})
export class ChangeBioPage{
  edit_bio$: boolean = true;

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
   * Change the bio
   */
  async write_bio(form: NgForm) {
    this.edit_bio$ = true;

    const el = await this.loadingCtrl.create({
      message: 'Updating bio...'
    });

    el.present();

    this.api.changeBio$(form.value.bio).subscribe(
      () => {
        el.dismiss();
        this.closePopover();
      },
      (error) => {
        el.dismiss();
        this.showError(error);
      }
    );

    this.SetService.updateIdentity();
  }

  async showError(error:string) {
    const el = await this.alertCtrl.create({
      header: "Something went wrong while saving your bio.",
      message: error,
      buttons: ["Continue"]
    });

    el.present();
  }
}
