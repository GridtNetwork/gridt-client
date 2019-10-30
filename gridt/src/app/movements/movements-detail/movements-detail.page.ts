import { Component, OnInit, Input } from '@angular/core';
import { Movement } from 'src/api/model/movement';
import { ModalController, NavController, AlertController } from '@ionic/angular';
import { MovementsService } from '../movement.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MovementJoinComponent } from '../movement-join/movement-join.component';


@Component({
  selector: 'app-movements-detail',
  templateUrl: './movements-detail.page.html',
  styleUrls: ['./movements-detail.page.scss'],
})
export class MovementsDetailPage implements OnInit {

  @Input() selectedMovement: Movement;

  movements: Movement[];
  movement: Movement;

  constructor(
    private movementsService: MovementsService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private router: Router
    ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      this.movement = this.movementsService.getMovement(paramMap.get('movementId'));
      console.log(paramMap);
      
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
            this.movementsService.IsSubscribed( this.movement.id);
            this.router.navigate(['/timeline']);
          },
        },
        {
          text: 'Connect me with random people',
          handler: () => {
            this.movementsService.IsSubscribed(this.movement.id);
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


}
