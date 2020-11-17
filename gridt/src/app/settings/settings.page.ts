import { Component, OnInit  } from '@angular/core';
import { AlertController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { ChangePasswordPage } from './change-password/change-password.page';
import { ChangeBioPage } from './change-bio/change-bio.page';
import { Observable, Subscription, of, ReplaySubject } from 'rxjs';
import { take, flatMap, catchError, filter } from 'rxjs/operators';

import { SettingsService} from '../core/settings.service'
import { Identity } from '../core/models/identity.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit  {
  identity$: Observable<Identity>;
  isDisabled$: Observable<boolean> = of(true);
  gravatar: string;

  private serverWarn$ = new ReplaySubject<boolean>(1);
  private subscriptions: Array<Subscription> = [];

  constructor(
    private setService: SettingsService,
    private alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public popoverCntrl: PopoverController,
    public toastCntrl: ToastController,
  ) { }

  ngOnInit() {
    this.identity$ = this.setService.userIdentity$;

    this.identity$.pipe(take(1)).subscribe(set => this.gravatar = `https://www.gravatar.com/avatar/${set.avatar}`);

    this.subscriptions.push( this.identity$.pipe(
      flatMap( () => of(false)),
      catchError( () => {
        this.serverWarning();
        return of(true);
      }),
    ).subscribe( (val) => {this.isDisabled$ = of(val);}));

    this.setService.updateIdentity(this.serverWarn$);

    this.serverWarn$.asObservable().pipe(
      filter( val => val == true)
    ).subscribe( () => {
      this.serverWarning();
      this.isDisabled$ = of(true);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  public refreshPage(event?: any) {
    this.setService.updateIdentity(this.serverWarn$);
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
   * Show the change Email modal
   */
  async changePassword() {
    const passwordPopover = await this.popoverCntrl.create({
      component: ChangePasswordPage
    });
    return await passwordPopover.present();
  }

  async changeBio() {
    const bioPopover = await this.popoverCntrl.create({
      cssClass: 'pop-class',
      component: ChangeBioPage
    });
    return await bioPopover.present();
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
