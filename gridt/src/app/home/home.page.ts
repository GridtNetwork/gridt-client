import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { ApiService } from '../core/api.service';
import { Movement } from '../core/movement.model';
import { User } from '../core/user.model';
import { SwapService } from '../core/swap.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  movements$ = new Observable<Movement[]>();

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private swapService: SwapService
  ) { }

  ngOnInit() {
    this.movements$ = this.api.subscriptions$;
    this.api.getSubscriptions();
  }

  ngOnDestroy() {
    this.alertCtrl.dismiss();
  }

  /**
   * Extract the timezone of a date string.
   * @param date_string ISO Date string
   */
  private extract_timezone(date_string: string): number {
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
        timezone = this.extract_timezone(leader.last_signal.time_stamp);
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
      server_timezone = this.extract_timezone(leader.last_signal.time_stamp);
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
      const server_timezone = this.extract_timezone(time_stamp);
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
        .then(alertEl => alertEl.present())
      }
    );
  }
}
