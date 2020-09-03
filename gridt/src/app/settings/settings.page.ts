import { Component, OnInit, ViewChild  } from '@angular/core';
import { AlertController, LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { ChangeEmailPage } from './change-email/change-email.page';
import { ChangePasswordPage} from './change-password/change-password.page';
import { Observable, timer } from 'rxjs';
import { timeout, tap, filter } from 'rxjs/operators';

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
  isDisabledval: boolean;
  gravatar: string;

  edit_bio$: boolean = true;

  constructor(
    private SetService: SettingsService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public popoverCntrl: PopoverController,
    public toastCntrl: ToastController,
  ) { }

  ngOnInit() {
    this.settings$ = this.SetService.the_user_settings$;
    this.SetService.getUserSettings();

    this.isDisabled$ = this.SetService.isDisabled$;

    this.settings$.subscribe(set => this.gravatar = "https://www.gravatar.com/avatar/" + set.identity.avatar);
    console.log(`gravatar is ${JSON.stringify(this.gravatar)}`)

    // Raise warning toast when isDisabled$ becomes true
    this.isDisabled$.pipe(
      filter (val => val == true),
      tap( () =>  this.serverWarning() )
    ).subscribe();
  }

  // Create objects for the input field so we can set focus later.
  @ViewChild('bio', {static: true}) bioInput;
  @ViewChild('name', {static: true}) nameInput;
  @ViewChild('emailfield', {static: true}) emailInput;
  @ViewChild('passwordfield', {static: true}) passwordInput;

  public refreshPage(event?) {
    this.SetService.getUserSettings();
    if (event) { event.target.complete(); }
  }

  // When server is not available inform user with toast
  async serverWarning() {
    const toast = await this.toastCntrl.create({
      message: 'Server could not be reached, refresh the page to try again.',
      position: 'bottom',
      buttons: [
        {
          side: 'start',
          text: 'Refresh',
          handler: () => {
            toast.dismiss()
            this.refreshPage();
          }
        }, {
          role: 'cancel',
          icon: 'close-outline'
        }
      ]
    });
    toast.present();
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
   * Show the change Email modal
   */
  async changeEmail() {
    const emailPopover = await this.popoverCntrl.create({
      cssClass: 'pop-class',
      component: ChangeEmailPage
    });
    return await emailPopover.present();
  }

  async changePassword() {
    const passwordPopover = await this.popoverCntrl.create({
      component: ChangePasswordPage
    });
    return await passwordPopover.present();
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
