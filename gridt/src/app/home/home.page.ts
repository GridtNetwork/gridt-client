import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../api/api.service';
import { AlertController } from '@ionic/angular';
import { Movement } from '../api/movement.model';
import { Observable } from 'rxjs';
import { User } from '../api/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  movements$ = new Observable<Movement[]>();
 
  constructor(private api: ApiService, private alertCtrl: AlertController) { }

  ngOnInit() {
    this.movements$ = this.api.subscriptions$;
    this.api.getSubscriptions();
  }

  ngOnDestroy() { }

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
        date.setUTCHours(hour_offset, 0, 0, 0);
        // On monday go back an entire week.
        const reduction = date.getUTCDay() ?  date.getUTCDay(): 7 
        date.setUTCDate(date.getUTCDate() - reduction);
        break;
    }

    return date;
  }

  isLeaderDone(leader: User, movement: Movement): boolean {
    let server_timezone: number = null;
    let last_signal: Date; 
    
    if ( 'last_signal' in leader) {  
      server_timezone = parseInt(leader.last_signal.time_stamp.match(/\+(\d\d):\d\d/sg)[0]);
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
    this.api.swapLeader$(movement, leader).subscribe(
      async (user) => {
        const el = await this.alertCtrl.create({
          header: "Found new leader",
          message: `Your new leader is ${user.username}.`
        });
        
        el.present();
      } 
    )
  }

  update(movement: Movement): void {
    this.api.sendUpdate$(movement).subscribe(
      () => {this.api.subscriptions$.subscribe(console.log)},
      (error) => {
        this.alertCtrl.create({
            header: 'Something went wrong while sending your update.',
            message: error,
            buttons: ['Okay']
        })
        .then(alertEl => alertEl.present())
      }
    );
  }
}
