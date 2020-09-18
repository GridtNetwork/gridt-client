import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { map, flatMap, take } from 'rxjs/operators';

import { ApiService } from '../../core/api.service';
import { Movement } from '../../core/models/movement.model';

@Component({
  selector: 'app-movements-detail',
  templateUrl: './movements-detail.page.html',
  styleUrls: ['./movements-detail.page.scss'],
})
export class MovementsDetailPage implements OnInit, OnDestroy {

  movement$: Observable<Movement>;
  private movSubSubscription: Subscription;
  private movUnsubSubscription: Subscription;

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private api: ApiService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('movementId');
    this.movement$ = this.api.allMovements$.pipe(
      map(movements => movements.filter( movement => movement.name === id )[0])
    );
  }

  ngOnDestroy() {
    if (this.alertCtrl) {
      this.alertCtrl.dismiss();
    }
    this.cancelAllSubscriptions();
  }
  private cancelAllSubscriptions() {
    if (this.movSubSubscription) {
      this.movSubSubscription.unsubscribe();
    }
    if (this.movUnsubSubscription) {
      this.movUnsubSubscription.unsubscribe();
    }
  }

  onSubscribe(): void {
    this.alertCtrl.create({
      header: 'Are you sure?',
      message: 'You are about to subscribe to this movement.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.subscribe();
          },
        },
      ]
    })
    .then(alertEl => {
      alertEl.present();
    });
  }

  onUnsubscribe():void {
    this.alertCtrl.create({
      header: 'Are you sure?',
      message: 'You are about to leave this movement.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.unsubscribe();
          },
        },
      ]
    })
    .then(alertEl => {
      alertEl.present();
    });
  }

  async subscribe () {
    const el = await this.loadingCtrl.create({
      message: 'Updating info...'
    });

    el.present();

    this.movSubSubscription = this.movement$.pipe(
      take(1),
      flatMap( (movement) => this.api.subscribeToMovement$(movement.name)),
      flatMap( () => this.movement$), // We need the movement name again to reload the movement.
      take(1),
      flatMap( (movement) => this.api.getMovement$(movement.name))
    ).subscribe(
      () => el.dismiss(),
      (error) => {
        el.dismiss();
        this.showError(error);
      }
    );
  }

  async showError(error: string) {
    const el = this.alertCtrl.create({
      header: "Something went wrong.",
      message: error,
      buttons: ["Okay"]
    });
  }

  async unsubscribe() {
    const el = await this.loadingCtrl.create({
        message: 'Updating info...'
    });

    el.present();

    this.movUnsubSubscription = this.movement$.pipe(
      take(1),
      flatMap( movement => this.api.unsubscribeFromMovement$(movement.name) ),
      flatMap( () => this.movement$ ),
      take(1),
      flatMap( movement => this.api.getMovement$(movement.name) )
    ).subscribe(
      () => el.dismiss(),
      (error) => {
        el.dismiss();
        this.showError(error);
      }
    );
  }
}
