import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { error } from 'protractor';
import { Observable, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ApiService } from '../core/api.service';
import { Movement } from '../core/models/movement.model';
import { User } from '../core/models/user.model';
import { SecureStorageService } from '../core/secure-storage.service';
import { SettingsService } from '../core/settings.service';
import { SwapService } from '../core/swap.service';
import { SortingPage } from './sorting/sorting.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  movements$ = new Observable<Movement[]>();
  iconName: string;
  avatar: string;
  sortingOption: string;

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private swapService: SwapService,
    private secStorage: SecureStorageService,
    private settingsService: SettingsService,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) { }

  async ngOnInit() {
    this.movements$ = this.api.subscriptions$;
    await this.getSortingOption();
    await this.getIconName();
    if (this.iconName == null) {
      this.iconName = "grid-outline";
    }
    console.log("icon: " + this.iconName);
    console.log("sorting: " + this.sortingOption);
    this.api.getSubscriptions();
    this.sortMovements(this.sortingOption);

  }

  sortMovements(option: string) {
    switch (option) {
      case "A-first":
        this.movements$ = this.movements$.pipe(map( results => results.sort(this.ascendingAlphabet)));
        break;
      case "A-last":
        this.movements$ = this.movements$.pipe(map( results => results.sort(this.descendingAlphabet)));
        break;
      case "D-first":
        this.movements$ = this.movements$.pipe(map( results => results.sort(
            (a, b) => this.ascendingDone(this.readyToSignal(a), this.readyToSignal(b))
          )));
        break;
      case "D-last":
        this.movements$ = this.movements$.pipe(map( results => results.sort(
            (a, b) => this.descendingDone(this.readyToSignal(a), this.readyToSignal(b))
          )));
        break;
      default:
        this.movements$ = this.movements$.pipe(map( results => results.sort(this.ascendingAlphabet)));
        break;
    }
  }

  ascendingAlphabet(a: Movement, b: Movement) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }

  descendingAlphabet(a: Movement, b: Movement) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA > nameB) {
      return -1;
    }
    if (nameA < nameB) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }

  ascendingDone(a: boolean, b: boolean) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  descendingDone(a: boolean, b: boolean) {
    if (a > b) {
      return -1;
    }
    if (a < b) {
      return 1;
    }
    return 0;
  }

  ngOnDestroy() {
    this.alertCtrl.dismiss();
  }

  /**
   * Extract the timezone of a date string.
   * @param date_string ISO Date string
   */
  private extractTimezone(date_string: string): number {
    return parseInt(date_string.match(/\+(\d\d):\d\d/g)[0])
  }

  /**
   * Calculate when the last global signal reset was.
   * @param interval Interval that on which the event is supposed to happen.
   * @param hour_offset Timezone offset to account for the possibility that the server is not in the timezone of the client.
   */
  public getLastOccurence(
    interval: "daily" | "twice daily" | "weekly",
    hour_offset: number
  ): Date {
    let date = new Date();

    switch (interval) {
      case "daily":
        date.setUTCHours(hour_offset, 0, 0, 0);
        break;
      case "twice daily":
        if ( date.getUTCHours() < 12 ) {
          date.setUTCHours(hour_offset, 0, 0, 0);
        } else {
          date.setUTCHours(hour_offset + 12, 0, 0, 0);
        }
        break;
      case "weekly":
        date.setUTCDate(date.getUTCDate() - date.getUTCDay());
        date.setUTCHours(hour_offset, 0, 0, 0);
        break;
    }

    return date;
  }

  setIconName(iconName: string){
    this.secStorage.set$("iconName", iconName).pipe(take(1)).subscribe(
      () => this.secStorage.get$("iconName").pipe(take(1)).subscribe(
        (name: string) => this.iconName = name,
        (err) => console.log(err)
      )
    );
  }

  async getIconName() {
    await this.secStorage.get$("iconName").pipe(take(1)).subscribe(
      (name: string) => this.iconName = name,
      (err) => console.log(err)
    );
  }

  async getSortingOption() {
    await this.secStorage.get$("sortingOption").pipe(take(1)).subscribe(
      (option) => this.sortingOption = option,
      (err) => console.log(err)
    );
  }

  /**
   * Check if the user should be allowed to swap his leaders in this movement.
   * @param movement Movement in which the leaders can be swapped or not.
   */
  canSwap(movement: Movement): boolean {
    if (!movement.last_signal_sent) {
      return false;
    }

    const last_signal_sent = new Date(movement.last_signal_sent.time_stamp);
    let timezone: number;
    for (let leader of movement.leaders) {
      if (leader.last_signal) {
        timezone = this.extractTimezone(leader.last_signal.time_stamp);
        break;
      }
    }

    if (timezone === undefined) {
      return true;
    }

    const last_reset = this.getLastOccurence(movement.interval, timezone);

    if (this.swapService.getLastSwapEvent(movement)) {
      const last_swap = this.swapService.getLastSwapEvent(movement).date;
      return (last_swap < last_reset) && (last_reset < last_signal_sent);
    };

    return last_signal_sent > last_reset;
  }

  isLeaderDone(leader: User, movement: Movement): boolean {
    let server_timezone: number = null;
    let last_signal: Date;

    if ( leader.last_signal ) {
      server_timezone = this.extractTimezone(leader.last_signal.time_stamp);
      last_signal = new Date(Date.parse(leader.last_signal.time_stamp));
    } else {
      return false;
    }

    return this.getLastOccurence(movement.interval, server_timezone) < last_signal;
  }

  async confirmSwapLeader(movement: Movement, leader: User) {
    const el = await this.alertCtrl.create({
      header: "Confirm leader change",
      message: `Are you sure you want to replace user ${leader.username}"?`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Yes",
          handler: () => this.swapLeader(movement, leader)
        }
      ]
    });

    el.present();
  }

  swapLeader(movement: Movement, leader: User): void {
    this.swapService.addSwapEvent(movement, leader);
    this.api.swapLeader$(movement, leader).subscribe(
      async user => {
        const el = await this.alertCtrl.create({
          header: "Found new leader",
          message: `Your new leader is ${user.username}.`,
          buttons: ["okay"]
        });

        el.present();
      },
      async error => {
        const el = await this.alertCtrl.create({
          header: "No new leader found",
          message: `We tried to find you a new user but: ${error}`,
          buttons: ["okay..."]
        });

        el.present();
      }
    );
  }

  readyToSignal (movement: Movement): boolean {
    if ( movement.last_signal_sent ) {
      const time_stamp = movement.last_signal_sent.time_stamp;
      const server_timezone = this.extractTimezone(time_stamp);
      const last_reset = this.getLastOccurence(movement.interval, server_timezone);
      const last_signal = new Date(time_stamp);
      return last_reset > last_signal;
    } else {
      return true;
    }
  }

  async confirmSignal (movement: Movement) {
    const el = await this.alertCtrl.create({
      header: "Want to send a message with your signal?",
      message: '',
      cssClass: "confirmSignal-alert", // makes message text go red
      inputs: [
        {
          name: "message",
          placeholder: "message",
          type: "text",
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: 'cancel',
        },
        {
          text: "Send!",
          handler: (data) => {
            if ( data.message !== null && data.message.length < 140){
              this.signal(movement, data.message);
            }
            else if ( data.message == null ){
              el.message = ('Your message is empty!');
              return false;
            }
            else if ( data.message.length > 140 ){
              el.message = ('Your message is longer than 140 characters!');
              return false;
            }
            else {
              el.message = ('Something went wrong, please try again.');
              return false;
            }
          }
        }
      ]
    });

    el.present();
  }

  async signal(movement: Movement, message?: string) {
    this.api.sendSignal$(movement, message).subscribe(
      () => {
        this.api.getMovement$(movement.id).subscribe();
      },
      (error) => {
        this.alertCtrl.create({
            header: 'Something went wrong while sending your signal.',
            message: error,
            buttons: ['Okay']
        })
        .then(alertEl => alertEl.present());
      }
    );
  }
  async showMenu() {
    const modal = await this.modalController.create({
      component: SortingPage,
      cssClass: 'Ion-modal',
      componentProps: {
        'firstName': 'Douglas',
        'lastName': 'Adams',
        'middleInitial': 'N'
      }
    });
    await modal.present();

    await modal.onDidDismiss().then(({data}) => {
      if (data != null) {
        console.log("sort: " + data.option);
        this.sortMovements(data.option);
      }
  });

  }
  clearStorage() {
    this.secStorage.remove$("iconName").pipe(take(1)).subscribe();
    this.secStorage.remove$("sortingOption").pipe(take(1)).subscribe();
    this.secStorage.remove$("filterOption").pipe(take(1)).subscribe();
  }
  changeGrid() {
    if (this.iconName === "grid-outline") {
    this.setIconName("list-outline");
    } else {
      this.setIconName("grid-outline");
    }
  }

}
