import { Component, OnInit, ViewChild, AfterViewInit  } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { NgForm } from '@angular/forms';

import { SettingsService} from '../core/settings.service'
import { Settings } from '../core/settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit  {
  settings$: Observable<Settings>;
  isDisabled$: Observable<boolean>;
  gravatar: string;

  edit_bio$: boolean = true;
  edit_name$: boolean = true;
  edit_email$: boolean = true;
  edit_password$: boolean = true;

  constructor(
    private SetService: SettingsService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.SetService.populateStorage();
    this.settings$ = this.SetService.the_user_settings$;
    this.SetService.getUserSettings();

    this.isDisabled$ = this.SetService.isDisabled$;
    this.settings$.subscribe(set => this.gravatar = "https://www.gravatar.com/avatar/" + set.identity.avatar);
    console.log(`gravatar is ${this.gravatar}`)
  }

  @ViewChild('bio', {static: true}) bioInput;
  @ViewChild('name', {static: true}) nameInput;
  @ViewChild('email', {static: true}) emailInput;

  public refreshPage(event) {
    this.SetService.getUserSettings();
    event.target.complete();
  }

  async write_bio_change(form: NgForm) {
    this.edit_bio$ = true;

    const el = await this.loadingCtrl.create({
      message: 'Updating bio...'
    });

    el.present();

    this.SetService.putBio$(form.value.bio).pipe(timeout(5000)).subscribe(
      () => el.dismiss(),
      (error) => {
        el.dismiss();
        this.showError(error);
      }
    );

    this.SetService.getUserSettings();
  }

  Submit_name_change(form: NgForm) {
    this.edit_name$ = true;
    console.log(`Setting name to ${form.value.name}`)

    this.SetService.saveUsername(form.value.name);
  }

  Submit_email_change(form: NgForm) {
    this.edit_email$ = true;
    console.log(`Setting email to ${form.value.email}`)

    this.SetService.saveEmail(form.value.email);
  }

  Submit_password_change(form: NgForm) {
    console.log(form.value.name)
  }

  public change_bio() {
    this.edit_bio$ = false;
    this.bioInput.setFocus();
  }

  public change_name() {
    this.edit_name$ = false;
    this.nameInput.setFocus();
  }

  public change_email() {
    console.log('setting change_name to false')
    this.edit_email$ = false;
    this.emailInput.setFocus();
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
