import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Movement } from 'src/api/model/movement';
import { ModalController, NavController, AlertController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MovementsService } from '../movements.service';
import { TimelineService } from 'src/app/timeline/timeline.service';


@Component({
  selector: 'app-movements-detail',
  templateUrl: './movements-detail.page.html',
  styleUrls: ['./movements-detail.page.scss'],
})
export class MovementsDetailPage implements OnInit, OnDestroy {

  @Input() selectedMovement: Movement;

  movements: Movement[];
  movement: Movement;
  isSubscribe = false;
  isLoading = false;
  private sub: Subscription;

  constructor(
    private movementsService: MovementsService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private router: Router,
    private loadingCtrl: LoadingController,
    ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('movementId')) {
        this.navCtrl.navigateBack('/movements');
        return;
      }
      this.isLoading = true;
      this.sub = this.movementsService
        .getMovements(paramMap.get('movementId'))
        .subscribe(
          movement => {
            this.movement = movement;
            this.isLoading = false;
          },
        );
    });
  }

  onJoin() {
    this.alertCtrl
    .create({
      header: 'Are you sure?',
      message: 'Do you wanna join this movement',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Connect me with people I know',
          handler: () => {
            this.Joining();

          },
        },
        {
          text: 'Connect me with random people',
          handler: () => {
            this.Joining();
          },
        },
      ]
    })
    .then(alertEl => {
      alertEl.present();
    });
}


  Joining() {
    this.loadingCtrl
      .create({
        message: 'Updating info...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.movementsService
          .Subscribe(
            this.movement.id,
          )
          .subscribe(() => {
            loadingEl.dismiss();

            this.router.navigate(['/timeline']);
          });
      });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
