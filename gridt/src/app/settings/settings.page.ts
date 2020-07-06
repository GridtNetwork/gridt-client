import { Component, OnInit, ViewChild  } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable, timer } from 'rxjs';
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
    this.SetService.getSettingsFromServer();
    this.settings$ = this.SetService.the_user_settings$;
    this.SetService.getUserSettings();

    this.isDisabled$ = this.SetService.isDisabled$;
    this.settings$.subscribe(set => this.gravatar = "https://www.gravatar.com/avatar/" + set.identity.avatar);
    console.log(`gravatar is ${JSON.stringify(this.gravatar)}`)
  }

  // Create objects for the input field so we can set focus later.
  @ViewChild('bio', {static: true}) bioInput;
  @ViewChild('name', {static: true}) nameInput;
  @ViewChild('emailfield', {static: true}) emailInput;
  @ViewChild('passwordfield', {static: true}) passwordInput;

  // When pulling down on page this function is called.
  public refreshPage(event) {
    this.SetService.getUserSettings();
    event.target.complete();
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

    this.SetService.putBio$(form.value.bio).pipe(timeout(500)).subscribe(
      () => el.dismiss(),
      (error) => {
        el.dismiss();
        this.showError(error);
      }
    );

    timer(500).subscribe( () => this.SetService.getUserSettings());
  }

  /*
   * Enable editting of the bio
   */
  public edit_bio() {
    this.edit_bio$ = false;
    this.bioInput.setFocus();
  }

  /*
   * Reset the bio value
   */
  public reset_bio() {
    timer(500).subscribe( () => {
      this.edit_bio$ = true;
      this.settings$.subscribe(
        set => this.bioInput.value = set.identity.bio
      )
    })
  }

  /*
   * Change the email address
   */
  async write_email(form: NgForm) {
    this.edit_email$ = true;

    const el = await this.loadingCtrl.create({
      message: 'Updating email address...'
    });

    el.present();

    this.SetService.postEmail$(form.value.email).pipe(timeout(500)).subscribe(
      () => el.dismiss(),
      (error) => {
        el.dismiss();
        this.showError(error);
      }
    );

    timer(500).subscribe( () => this.SetService.getUserSettings());
  }

  /*
   * Enable editting of the email field
   */
  public edit_email() {
    this.edit_email$ = false;
    this.emailInput.setFocus();
  }

  /*
   * Reset the email value
   */
  public reset_email() {
    timer(500).subscribe( () => {
      this.edit_email$ = true;
      this.settings$.subscribe(
        set => this.emailInput.value = set.identity.email
      )
    })
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

    this.SetService.postPassword$(form.value.email).pipe(timeout(500)).subscribe(
      () => el.dismiss(),
      (error) => {
        el.dismiss();
        this.showError(error);
      }
    );

    timer(500).subscribe( () => this.SetService.getUserSettings());
  }

  /*
   * Enable editting of the password field
   */
  public edit_password() {
    this.edit_password$ = false;
    this.passwordInput.setFocus();
  }

  /*
   * Reset the password
   */
  public reset_password() {
    timer(500).subscribe( () => {
      this.edit_password$ = true;
      this.settings$.subscribe(
        set => this.passwordInput.value = set.identity.email
      )
    })
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
