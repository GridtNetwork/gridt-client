import { LoginService } from './../../login/login.service';
import { MovementModel } from './../movement.model';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { ModalController, NavController, AlertController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MovementsService} from '../movements.service';
import { TimelineService } from 'src/app/timeline/timeline.service';
import { take, switchMap } from 'rxjs/operators';
import { Timeline } from 'src/app/timeline/timeline.model';


@Component({
  selector: 'app-movements-detail',
  templateUrl: './movements-detail.page.html',
  styleUrls: ['./movements-detail.page.scss'],
})
export class MovementsDetailPage implements OnInit, OnDestroy {

  @Input() selectedMovement: MovementModel;

  movements: MovementModel[];
  movement: MovementModel;
  timeline: Timeline;
  isSubscribe = false;
  isLoading = false;
  private sub: Subscription;
  private userid: string;
  public id: string;
  public movementId: string;

  constructor(
    private movementsService: MovementsService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private timelineService: TimelineService,
    private authService: LoginService
    ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('movementId')) {
        this.navCtrl.navigateBack('/movements');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId
        .pipe(
          take(1),
          switchMap(userId => {
            if (!userId) {
              throw new Error('Found no user!');
            }
            fetchedUserId = userId;
            this.userid=userId;

            return this.movementsService.getMovements(paramMap.get('movementId'));
          })
        )
        .subscribe(
          movement => {
            this.movement = movement;
            this.isLoading = false;
          },
          error => {
            this.alertCtrl
              .create({
                header: 'An error ocurred!',
                message: 'Could not load place.',
                buttons: [
                  {
                    text: 'Okay',
                    handler: () => {
                      this.router.navigate(['/timeline']);
                    }
                  }
                ]
              })
              .then(alertEl => alertEl.present());
          }
        );
    });
  }
  ionViewWillEnter() {
    this.timelineService.Infofor(this.movementId);
    this.id=this.timelineService.a;
    console.log(this.movementId);
    this.timelineService.Foor(this.movementId);
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
          text: 'Yes',
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
        this.movementsService.Join(this.movement.id,  this.movement, this.userid).subscribe(data => console.log(data));
        this.timelineService
          .addOne(
            this.movement.id,
            this.movement.name
          )
          .subscribe(() => {
            loadingEl.dismiss();


          this.router.navigate(['/timeline']);
          });
      });
  }

  Unsubscribe() {
    this.loadingCtrl
      .create({
        message: 'Updating info...'
      })
      .then(loadingEl => {
        loadingEl.present();
        console.log('aaaaa');
        this.timelineService.Unsubscribe()
          .subscribe(() => {
            loadingEl.dismiss();


          this.router.navigate(['/movements']);
          });
      });
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
