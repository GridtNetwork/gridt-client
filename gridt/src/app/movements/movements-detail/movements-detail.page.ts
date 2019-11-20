
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Movement } from 'src/api/model/movement';
import { ModalController, NavController, AlertController, LoadingController } from '@ionic/angular';

import { ActivatedRoute, Router } from '@angular/router';
import { MovementJoinComponent } from '../movement-join/movement-join.component';
import { Subscription } from 'rxjs';
import { MovementsService } from '../movements.service';


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
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private router: Router,
    private loadingCtrl: LoadingController
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
            
            //this.isSubscribe = movement.subscribed === false;
            this.isLoading = false;
          },
          
        );
      
    });
  }

  onJoin() {

    console.log(this.movement.subscribed);
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
            this.movementsService.Subscribe( this.movement.id);
            this.router.navigate(['/timeline']);
          },
        },
        {
          text: 'Connect me with random people',
          handler: () => {
            this.movementsService.Subscribe(this.movement.id);
            console.log(this.movement.subscribed);
            this.router.navigate(['/timeline']);
          },
        },
      ]
    })
    .then(alertEl => {
      alertEl.present();
    });
}

ngOnDestroy() {
  if (this.sub) {
    this.sub.unsubscribe();
  }
}

}
