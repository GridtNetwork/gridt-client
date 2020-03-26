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
  private subscriptions = [];
  movements$ = new Observable<Movement[]>();
 
  constructor(private api: ApiService, private alertCtrl: AlertController) { }

  ngOnInit() {
    this.movements$ = this.api.subscriptions$;
    this.api.getSubscriptions();
  }

  ngOnDestroy() { }

  isLeaderDone(leader: User): boolean {
    return true;
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

  swapLeader(movement: Movement, leader: User) {
    this.api.swapLeader$(movement, leader).subscribe(
      (user) => {} // TODO: alert user of new leader. 
    )
  }

  update(movement: Movement) {
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
